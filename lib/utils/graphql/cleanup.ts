export type DeepOmitTypename<T> = T extends null | undefined
	? T
	: T extends Array<infer U>
		? Array<DeepOmitTypename<U>>
		: T extends object
			? {
					[K in Exclude<keyof T, "__typename">]: DeepOmitTypename<T[K]>;
				}
			: T;

export function removeTypenames<T>(obj: T): DeepOmitTypename<T> {
	if (obj === null || obj === undefined || typeof obj !== "object") {
		return obj as any;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => removeTypenames(item)) as any;
	}

	return Object.entries(obj).reduce(
		(acc, [key, value]) => {
			if (key !== "__typename") {
				acc[key as keyof typeof acc] = removeTypenames(value);
			}
			return acc;
		},
		{} as Record<string, any>,
	) as any;
}
