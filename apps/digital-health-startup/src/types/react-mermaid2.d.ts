declare module 'react-mermaid2' {
  import * as React from 'react';
  
  export interface MermaidProps {
    chart: string;
    config?: any;
  }
  
  const Mermaid: React.FC<MermaidProps>;
  export default Mermaid;
}

