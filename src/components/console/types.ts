import { type Message } from 'console-feed/lib/definitions/Console';

export type ConsoleMessageEventData =
  | { type: 'console:init' }
  | { type: 'console:message'; message: Message }
  | { type: 'console:command'; command: string };
