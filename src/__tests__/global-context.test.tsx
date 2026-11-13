import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import { ipcChannels } from '@/config/ipc-channels';
import { DEFAULT_KEYBINDS, DEFAULT_SETTINGS } from '@/config/settings';
import { GlobalContextProvider } from '@/renderer/context/global-context';
import { play } from '@/renderer/lib/sounds';

jest.mock('@/renderer/lib/sounds', () => ({
	play: jest.fn(),
	preload: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: jest.fn() }));

type Handler = (...args: any[]) => any;

describe('GlobalContextProvider PLAY_SOUND', () => {
	const handlers: Record<string, Handler> = {};
	let allowSounds = true;
	const on = jest.fn((channel: string, handler: Handler) => {
		handlers[channel] = handler;
	});
	const send = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		Object.keys(handlers).forEach((k) => delete handlers[k]);
		allowSounds = true;
		(window as any).electron = {
			ipcRenderer: {
				on,
				send,
				removeAllListeners: jest.fn(),
				invoke: jest.fn(async (channel: string) => {
					if (channel === ipcChannels.GET_APP_INFO) return {};
					return {
						settings: { ...DEFAULT_SETTINGS, allowSounds },
						keybinds: DEFAULT_KEYBINDS,
						messages: [],
						appMenu: [],
					};
				}),
			},
		};
	});

	const flush = () => act(async () => {});

	it('follows the live allowSounds setting without re-registering listeners', async () => {
		// Sounds are off at mount time
		allowSounds = false;
		render(<GlobalContextProvider />);
		await flush();

		handlers[ipcChannels.PLAY_SOUND]('ding');
		expect(play).not.toHaveBeenCalled();

		// User turns sounds on; main process announces the change
		allowSounds = true;
		await act(async () => {
			await handlers[ipcChannels.APP_UPDATED]({});
		});
		await flush();

		handlers[ipcChannels.PLAY_SOUND]('ding');
		expect(play).toHaveBeenCalledTimes(1);
		expect(play).toHaveBeenCalledWith({ name: 'ding' });

		// And off again
		allowSounds = false;
		await act(async () => {
			await handlers[ipcChannels.APP_UPDATED]({});
		});
		await flush();

		handlers[ipcChannels.PLAY_SOUND]('ding');
		expect(play).toHaveBeenCalledTimes(1);

		// Setting changes must not re-run the mount effect
		const soundRegistrations = on.mock.calls.filter(
			([c]) => c === ipcChannels.PLAY_SOUND,
		);
		expect(soundRegistrations).toHaveLength(1);
		expect(send).toHaveBeenCalledTimes(1);
		expect(send).toHaveBeenCalledWith(ipcChannels.RENDERER_READY);
	});
});
