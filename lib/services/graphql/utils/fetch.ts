import { getMimeTypeFromExtension } from '@/lib/utils/file';
import { CombinedError } from 'urql';

/** Hard ceiling so a half-open connection can never hang an upload forever. */
const DEFAULT_TIMEOUT_MS = 75_000;
import { DocumentNode } from 'graphql';
import { print } from 'graphql/language/printer';
import { getAuthTokens } from '@/lib/utils/auth';

export function generateRNFile(uri: string) {
  return {
    uri,
    name: uri.split('/').pop() ?? '',
    type: getMimeTypeFromExtension(uri),
  };
}

function setByPath(obj: any, path: string[], value: any) {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
}

function manualExtractFiles(variables: any) {
  const clone = JSON.parse(JSON.stringify(variables));
  const filesMap = new Map<any, string[][]>();

  function traverse(current: any, path: string[] = []) {
    if (Array.isArray(current)) {
      current.forEach((item, index) => {
        const itemPath = [...path, index.toString()];
        if (item && typeof item === 'object' && 'uri' in item && 'name' in item && 'type' in item) {
          if (!filesMap.has(item)) filesMap.set(item, []);
          filesMap.get(item)!.push(itemPath);
        } else {
          traverse(item, itemPath);
        }
      });
    } else if (current && typeof current === 'object') {
      for (const key in current) {
        const item = current[key];
        const itemPath = [...path, key];
        if (item && typeof item === 'object' && 'uri' in item && 'name' in item && 'type' in item) {
          if (!filesMap.has(item)) filesMap.set(item, []);
          filesMap.get(item)!.push(itemPath);
        } else {
          traverse(item, itemPath);
        }
      }
    }
  }

  traverse(variables);

  for (const paths of filesMap.values()) {
    for (const p of paths) {
      setByPath(clone, p, null);
    }
  }

  return { clone, files: filesMap };
}

interface FormMutationOptions {
  headers?: Record<string, string>;
  /** External signal to cancel the request (e.g. the upload queue clearing/cancelling). */
  signal?: AbortSignal;
  /** Hard request timeout in ms (default 75s). */
  timeoutMs?: number;
}

export async function formMutation<R, V>(
  query: DocumentNode,
  variables: V,
  options: FormMutationOptions = {},
): Promise<{ data: R; error?: CombinedError }> {
  const { clone: variablesWithoutFiles, files: filesMap } = manualExtractFiles(variables);
  const operations = JSON.stringify({
    query: print(query),
    variables: variablesWithoutFiles,
  });
  const authTokens = await getAuthTokens();

  const hasFiles = filesMap.size > 0;
  const url = process.env.EXPO_PUBLIC_GRAPHQL_URL ?? '';

  // Bound every request: an internal timeout plus an optional external signal
  // (so the upload queue can cancel in-flight requests on clear/remove). Without
  // this a flaky network can leave a request half-open forever and wedge the queue.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener('abort', () => controller.abort());
  }

  let response: Response;
  try {
    if (!hasFiles) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authTokens?.access ? `Bearer ${authTokens.access}` : '',
          ...options.headers,
        },
        body: operations,
        signal: controller.signal,
      });
    } else {
      const formData = new FormData();
      formData.append('operations', operations);

      const map: Record<string, string[]> = {};
      let index = 0;

      for (const [file, paths] of filesMap) {
        const fieldName = `${index}`;
        map[fieldName] = paths.map((p) => `variables.${p.join('.')}`);
        formData.append(fieldName, {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
        index++;
      }

      formData.append('map', JSON.stringify(map));

      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authTokens?.access ? `Bearer ${authTokens.access}` : '',
          ...options.headers,
        },
        body: formData,
        signal: controller.signal,
      });
    }
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    console.error(await response.text());
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
  }

  // Surface GraphQL errors as a real `error` so callers' `res.error` checks work
  // (previously it was always undefined — dead code in the upload queue).
  return {
    ...result,
    error: result.errors?.length
      ? new CombinedError({ graphQLErrors: result.errors })
      : result.error,
  };
}
