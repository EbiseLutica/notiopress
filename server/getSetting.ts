import { readFileSync } from 'fs';

import { Settings } from '@/models/settings';

let settings: Settings;

export const getSetting = (): Settings => {
	return settings ? settings : (settings = JSON.parse(readFileSync('./user-assets/settings.json', 'utf-8')));
};
