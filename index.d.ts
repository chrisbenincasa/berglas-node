declare module "berglas-node" {
  export function resolve(
    gcpProjectId: string,
    berglasUri: string
  ): Promise<Buffer>;

  export function substitute(gcpProjectId: string): Promise<void>;
}
