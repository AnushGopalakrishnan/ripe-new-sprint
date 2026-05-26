import { RipeShellRuntime } from "@/components/ripe-shell-runtime";
import { getRipeNativeShellParts } from "@/lib/ripe-native-shell";

type RipeNativeShellProps = {
  bodyAttributes?: Record<string, string>;
  children: React.ReactNode;
};

export async function RipeNativeShell({ bodyAttributes, children }: RipeNativeShellProps) {
  const shell = await getRipeNativeShellParts();

  return (
    <>
      <RipeShellRuntime bodyAttributes={bodyAttributes} navMarkup={shell.navMarkup} />
      {children}
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: shell.footerMarkup }} />
    </>
  );
}
