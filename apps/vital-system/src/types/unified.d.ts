// Type stub for unified markdown processor
declare module 'unified' {
  export interface Processor {
    use(...args: any[]): Processor;
    parse(text: string): any;
    stringify(ast: any): string;
    process(text: string): Promise<any>;
  }

  export function unified(): Processor;
  export default unified;
}

declare module 'remark-parse' {
  const plugin: any;
  export default plugin;
}

declare module 'remark-rehype' {
  const plugin: any;
  export default plugin;
}

declare module 'rehype-stringify' {
  const plugin: any;
  export default plugin;
}

declare module 'rehype-react' {
  const plugin: any;
  export default plugin;
}
