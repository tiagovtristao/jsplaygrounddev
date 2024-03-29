import cn from 'classnames';
import { type FormEvent, type KeyboardEvent, useState, useRef } from 'react';
import { BiChevronRight } from 'react-icons/bi';

interface CommandHistory {
  commands: string[];
  lastSelectedReversed: number;
}

const NO_COMMAND_SELECTED = -1;

interface Props {
  onSubmit: (value: string) => void;
}

export default function Prompt({ onSubmit }: Props) {
  const [input, setInput] = useState('');
  const historyRef = useRef<CommandHistory>({
    commands: [],
    lastSelectedReversed: NO_COMMAND_SELECTED,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const preventDefault = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const history = historyRef.current;

    switch (event.code) {
      case 'ArrowUp': {
        event.preventDefault();

        if (!history.commands.length) {
          break;
        }

        const commandIndex =
          history.commands.length - (history.lastSelectedReversed + 1) - 1;
        if (commandIndex >= 0) {
          history.lastSelectedReversed++;
          setInput(history.commands[commandIndex]);
        }

        break;
      }
      case 'ArrowDown': {
        event.preventDefault();

        if (!history.commands.length) {
          break;
        }

        const commandIndex =
          history.commands.length - (history.lastSelectedReversed - 1) - 1;
        if (commandIndex < history.commands.length) {
          history.lastSelectedReversed--;
          setInput(history.commands[commandIndex]);
        }

        break;
      }
      case 'Enter': {
        historyRef.current.commands.push(input);
        historyRef.current.lastSelectedReversed = NO_COMMAND_SELECTED;
        setInput('');
        onSubmit(input);

        break;
      }
    }
  };

  return (
    <form
      className="flex items-center"
      onSubmit={preventDefault}
      onClick={() => inputRef?.current?.focus()}
    >
      <BiChevronRight className="ml-[6px] w-4 h-auto text-[#0076cf] dark:text-[#2fafff]" />

      <input
        ref={inputRef}
        className={cn(
          'ml-[12px] my-[2px] flex-one w-full bg-inherit text-[#2d2d2d] outline-none',
          'dark:text-[#c9d1d9]',
        )}
        type="text"
        value={input}
        onChange={(event) => setInput(event.currentTarget.value)}
        onKeyDown={onKeyDown}
        aria-label="Console prompt"
      />
    </form>
  );
}
