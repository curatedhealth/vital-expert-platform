// Mock for next/document to prevent import issues in App Router
// This provides safe no-op exports for document components

import React from 'react';

export const Html = ({ children, ...props }) => React.createElement('html', props, children);
export const Head = ({ children, ...props }) => React.createElement('head', props, children);
export const Main = (props) => React.createElement('div', { id: '__next', ...props });
export const NextScript = (props) => React.createElement('script', props);

export default function Document({ children }) {
  return React.createElement('html', null, children);
}