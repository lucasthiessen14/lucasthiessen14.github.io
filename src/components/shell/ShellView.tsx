import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { AlternateViewHeader } from '../views/AlternateViewHeader';
import {
  applyShellTabCompletion,
  type TabCycleState,
} from './shellCompletion';
import {
  formatShellPrompt,
  getShellBanner,
  runShellCommand,
  type ShellLine,
} from './shellCommands';

export function ShellView() {
  const [lines, setLines] = useState<ShellLine[]>(() => getShellBanner());
  const [cwd, setCwd] = useState('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabCycleRef = useRef<TabCycleState | null>(null);
  const prompt = formatShellPrompt(cwd);

  const scrollToBottom = useCallback(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const submit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      setHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
      tabCycleRef.current = null;

      const inputLine: ShellLine = {
        id: crypto.randomUUID(),
        type: 'input',
        text: trimmed,
        prompt: formatShellPrompt(cwd),
      };

      const result = runShellCommand(trimmed, cwd);
      if (result.cwd !== undefined) {
        setCwd(result.cwd);
      }

      if (result.lines.some((line) => line.id === '__clear__')) {
        setLines([]);
        return;
      }

      if (result.lines.length === 0) {
        setLines((prev) => [...prev, inputLine]);
        return;
      }

      setLines((prev) => [...prev, inputLine, ...result.lines]);
    },
    [cwd],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(input);
    setInput('');
    tabCycleRef.current = null;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const result = applyShellTabCompletion(input, cwd, tabCycleRef.current);
      tabCycleRef.current = result.cycle;
      setInput(result.input);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length === 0) return;
      const nextIndex =
        historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      tabCycleRef.current = null;
      setInput(history[nextIndex] ?? '');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex < 0) return;
      const nextIndex = historyIndex + 1;
      tabCycleRef.current = null;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] ?? '');
      }
    }
  };

  return (
    <div className="shell-view">
      <AlternateViewHeader title="~/portfolio" subtitle="bash — Lucas Thiessen" />
      <div
        className="shell-view__terminal"
        ref={outputRef}
        onClick={() => inputRef.current?.focus()}
        role="log"
        aria-live="polite"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`shell-view__line shell-view__line--${line.type}`}
          >
            {line.type === 'input' ? (
              <pre className="shell-view__input-line">
                <span className="shell-view__prompt">{line.prompt ?? prompt} $ </span>
                <span className="shell-view__command">{line.text}</span>
              </pre>
            ) : (
              <pre>{line.text}</pre>
            )}
          </div>
        ))}
        <form className="shell-view__form" onSubmit={onSubmit}>
          <label className="shell-view__input-row">
            <span className="shell-view__prompt" aria-hidden>
              {prompt}&nbsp;$&nbsp;
            </span>
            <input
              ref={inputRef}
              className="shell-view__input"
              type="text"
              value={input}
              onChange={(e) => {
                tabCycleRef.current = null;
                setInput(e.target.value);
              }}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoFocus
              aria-label="Shell command input"
            />
          </label>
        </form>
      </div>
    </div>
  );
}
