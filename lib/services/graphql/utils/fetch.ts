import { getMimeTypeFromExtension } from "@/lib/utils/file";
import { CombinedError } from "urql";
import { DocumentNode } from "graphql";
import { print } from "graphql/language/printer";

export function generateRNFile(uri: string) {
  return {
    uri,
    name: uri.split("/").pop() ?? "",
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
        if (
          item &&
          typeof item === "object" &&
          "uri" in item &&
          "name" in item &&
          "type" in item
        ) {
          if (!filesMap.has(item)) filesMap.set(item, []);
          filesMap.get(item)!.push(itemPath);
        } else {
          traverse(item, itemPath);
        }
      });
    } else if (current && typeof current === "object") {
      for (const key in current) {
        const item = current[key];
        const itemPath = [...path, key];
        if (
          item &&
          typeof item === "object" &&
          "uri" in item &&
          "name" in item &&
          "type" in item
        ) {
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
}

export async function formMutation<R, V>(
  query: DocumentNode,
  variables: V,
  options: FormMutationOptions = {},
): Promise<{ data: R; error?: CombinedError }> {
  const { clone: variablesWithoutFiles, files: filesMap } =
    manualExtractFiles(variables);
  const operations = JSON.stringify({
    query: print(query),
    variables: variablesWithoutFiles,
  });

  const hasFiles = filesMap.size > 0;

  let response: Response;

  if (!hasFiles) {
    response = await fetch(process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: operations,
    });
  } else {
    const formData = new FormData();
    formData.append("operations", operations);

    const map: Record<string, string[]> = {};
    let index = 0;

    for (const [file, paths] of filesMap) {
      const fieldName = `${index}`;
      map[fieldName] = paths.map((p) => `variables.${p.join(".")}`);
      formData.append(fieldName, {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
      index++;
    }

    formData.append("map", JSON.stringify(map));

    response = await fetch(process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "", {
      method: "POST",
      headers: options.headers,
      body: formData,
    });
  }

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
  }

  return result;
}
