// Type declarations for react-window and react-virtualized-auto-sizer
// These are placeholder declarations for components that may not be actively used

declare module 'react-window' {
  import * as React from 'react';

  export interface ListProps {
    listRef?: React.Ref<any>;
    defaultHeight?: number;
    rowCount: number;
    rowHeight: number;
    rowProps?: any;
    children: (props: { index: number; style: React.CSSProperties }) => React.ReactNode;
  }

  export interface ListImperativeAPI {
    scrollToRow: (index: number) => void;
  }

  export const List: React.ComponentType<ListProps>;
}

declare module 'react-virtualized-auto-sizer' {
  import * as React from 'react';

  interface AutoSizerProps {
    children: (size: { height: number; width: number }) => React.ReactNode;
    disableHeight?: boolean;
    disableWidth?: boolean;
    onResize?: (size: { height: number; width: number }) => void;
    defaultHeight?: number;
    defaultWidth?: number;
  }

  const AutoSizer: React.ComponentType<AutoSizerProps>;
  export default AutoSizer;
}
