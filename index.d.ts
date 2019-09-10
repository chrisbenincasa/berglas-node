declare module "berglas-node" {
  export function resolve(
    gcpProjectId: string,
    berglasUri: string
  ): Promise<string>;

  export function substitute(gcpProjectId: string): Promise<void>;
}
