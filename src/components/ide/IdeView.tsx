import { useMemo, useState } from 'react';
import { getPortfolioFiles, portfolioMeta } from '../../data/portfolioContent';
import { AlternateViewHeader } from '../views/AlternateViewHeader';

type TreeNode = {
  name: string;
  path: string;
  children?: TreeNode[];
  isFile: boolean;
};

function buildFileTree(files: ReturnType<typeof getPortfolioFiles>): TreeNode[] {
  const root: TreeNode[] = [];

  const ensureDir = (nodes: TreeNode[], name: string, path: string): TreeNode => {
    let dir = nodes.find((n) => n.name === name && !n.isFile);
    if (!dir) {
      dir = { name, path, isFile: false, children: [] };
      nodes.push(dir);
    }
    return dir;
  };

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = i === parts.length - 1;

      if (isFile) {
        current.push({ name: part, path: file.path, isFile: true });
      } else {
        const dir = ensureDir(current, part, currentPath);
        current = dir.children ?? [];
      }
    }
  }

  const sortNodes = (nodes: TreeNode[]): TreeNode[] =>
    [...nodes]
      .sort((a, b) => {
        if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
        return a.name.localeCompare(b.name);
      })
      .map((node) =>
        node.children ? { ...node, children: sortNodes(node.children) } : node,
      );

  return sortNodes(root);
}

function TreeItem({
  node,
  depth,
  activePath,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  activePath: string;
  onSelect: (path: string) => void;
}) {
  const padding = depth * 12;

  if (node.isFile) {
    return (
      <button
        type="button"
        className={`ide-view__tree-item ide-view__tree-item--file${activePath === node.path ? ' is-active' : ''}`}
        style={{ paddingLeft: padding }}
        onClick={() => onSelect(node.path)}
      >
        {node.name}
      </button>
    );
  }

  return (
    <div className="ide-view__tree-folder">
      <span className="ide-view__tree-item ide-view__tree-item--folder" style={{ paddingLeft: padding }}>
        {node.name}/
      </span>
      {node.children?.map((child) => (
        <TreeItem
          key={child.path}
          node={child}
          depth={depth + 1}
          activePath={activePath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export function IdeView() {
  const files = useMemo(() => getPortfolioFiles(), []);
  const tree = useMemo(() => buildFileTree(files), [files]);
  const [activePath, setActivePath] = useState('README.md');

  const activeFile = files.find((file) => file.path === activePath) ?? files[0];

  return (
    <div className="ide-view">
      <AlternateViewHeader title="portfolio" subtitle="Cursor — portfolio workspace" />
      <div className="ide-view__workspace">
        <aside className="ide-view__sidebar" aria-label="File explorer">
          <p className="ide-view__sidebar-label">Explorer</p>
          <nav className="ide-view__tree">
            {tree.map((node) => (
              <TreeItem
                key={node.path}
                node={node}
                depth={0}
                activePath={activePath}
                onSelect={setActivePath}
              />
            ))}
          </nav>
        </aside>
        <div className="ide-view__editor">
          <div className="ide-view__tabs">
            <span className="ide-view__tab is-active">{activeFile.name}</span>
          </div>
          <div className="ide-view__editor-body">
            <pre className="ide-view__code">
              <code>{activeFile.content}</code>
            </pre>
          </div>
          <footer className="ide-view__statusbar">
            <span>{activeFile.language}</span>
            <span>{activeFile.path}</span>
            <span>{portfolioMeta.name}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
