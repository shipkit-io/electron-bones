import { PlatformInfo } from '../utils/platform';

export type AppInfoType = {
	name: string;
	version: string;
	os: string;
	osVersion: string;
	platform: PlatformInfo;
	isMac: boolean;
	isWindows: boolean;
	isLinux: boolean;
	isDev: boolean;
};
