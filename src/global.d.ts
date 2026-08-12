export {};

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "@solana/wallet-adapter-react-ui/styles.css" {
  const content: Record<string, string>;
  export default content;
}

declare global {
  interface Window {
    ethereum: any;
  }
}
