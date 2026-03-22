// DATA SHOULD ONLY FLOW DOWNWARDS
// We pass data from the main process to the renderer process using IPC
// We also use IPC to update data

// todo: add os here

import { ipcChannels } from '@/config/ipc-channels';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import {
	DEFAULT_KEYBINDS,
	DEFAULT_SETTINGS,
	SettingsType,
} from '@/config/settings';
import { play, preload } from '@/renderer/lib/sounds';
import { AppInfoType } from '@/types/app';
import { CustomAcceleratorsType } from '@/types/keyboard';
import { getNativeWindowBorderRadius } from '@/utils/platform';
import { MenuItemConstructorOptions } from 'electron/renderer';
import { toast } from 'sonner';

interface GlobalContextType {
	app: Partial<AppInfoType>;
	appMenu: MenuItemConstructorOptions[];
	keybinds: CustomAcceleratorsType;
	message: string;
	messages: string[];
	settings: SettingsType;
	setSettings: (newSettings: Partial<SettingsType>) => void;
}

export const GlobalContext = React.createContext<GlobalContextType>({
	app: {},
	appMenu: [],
	keybinds: DEFAULT_KEYBINDS,
	message: '',
	messages: [],
	settings: DEFAULT_SETTINGS,
	setSettings: () => {},
});

export function GlobalContextProvider({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [appInfo, setAppInfo] = React.useState<Partial<AppInfoType>>({});
	const [appMenu, setAppMenu] = React.useState<MenuItemConstructorOptions[]>(
		[],
	);
	const [messages, setMessages] = React.useState<string[]>([]);

	const [settings, setCurrentSettings] =
		React.useState<SettingsType>(DEFAULT_SETTINGS);

	const [keybinds, setCurrentKeybinds] =
		React.useState<CustomAcceleratorsType>(DEFAULT_KEYBINDS);

	useEffect(() => {
		// Create handler for receiving asynchronous messages from the main process
		const synchronizeAppState = async () => {
			console.log(ipcChannels.APP_UPDATED);

			window.electron.ipcRenderer
				.invoke(ipcChannels.GET_RENDERER_SYNC)
				.then((res) => {
					const { settings: s, keybinds: k, messages: m, appMenu: menu } = res;
					setCurrentSettings(s);
					setCurrentKeybinds(k);
					setMessages(m);
					setAppMenu(menu);
				})
				.catch(console.error);
		};

		// Store unsubscribe functions for proper cleanup
		const unsubscribers: Array<(() => void) | undefined> = [];

		// Listen for messages from the main process
		const unsubAppUpdated = window.electron.ipcRenderer.on(ipcChannels.APP_UPDATED, async (data) => {
			console.log('APP_UPDATED', data);

			await synchronizeAppState();
		});
		unsubscribers.push(unsubAppUpdated);

		// Create notifications using the renderer
		const unsubNotification = window.electron.ipcRenderer.on(
			ipcChannels.APP_NOTIFICATION,
			({ title, body, action }: any) => {
				toast(title, {
					...(body ? { description: body } : {}),
					...(action ? { action } : {}),
				});
			},
		);
		unsubscribers.push(unsubNotification);

		// Get app info: name, version, paths, os - DOES NOT CHANGE
		window.electron.ipcRenderer
			.invoke(ipcChannels.GET_APP_INFO)
			.then((info) => {
				setAppInfo(info);

				// Set native window border radius based on OS and version
				if (info.platform) {
					const root = window.document.documentElement;
					root.style.setProperty(
						'--window-border-radius',
						getNativeWindowBorderRadius(info.platform),
					);
				}

				return info;
			})
			.then(() => {
				// SOUNDS
				preload();

				// Setup listener to play sounds
				const unsubSound = window.electron.ipcRenderer.on(ipcChannels.PLAY_SOUND, (sound: any) => {
					// Read latest settings via invoke to avoid stale closure
					window.electron.ipcRenderer
						.invoke(ipcChannels.GET_RENDERER_SYNC)
						.then((res) => {
							if (res?.settings?.allowSounds) {
								play({ name: sound });
							}
						})
						.catch(console.error);
				});
				unsubscribers.push(unsubSound);
			})
			.catch(console.error);

		// Request initial data when the app loads
		synchronizeAppState();

		// Let the main process know that the renderer is ready
		window.electron.ipcRenderer.send(ipcChannels.RENDERER_READY);

		return () => {
			// Clean up listeners using stored unsubscribe functions
			unsubscribers.forEach((unsub) => unsub?.());
		};
	}, []);

	// Electron API functions
	const setSettings = useCallback((newSettings: Partial<SettingsType>) => {
		window.electron.setSettings(newSettings);
	}, []);

	const value = useMemo(() => {
		return {
			app: appInfo,
			appMenu,
			keybinds,
			settings,
			setSettings,
			messages,
			message: messages[0] ?? '',
		};
	}, [appInfo, appMenu, keybinds, settings, setSettings, messages]);

	return (
		<GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
	);
}

export const useGlobalContext = () => {
	const context = useContext(GlobalContext);

	if (context === undefined)
		throw new Error('useGlobalContext must be used within a GlobalContext');

	return context;
};
