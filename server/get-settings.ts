import { Settings } from '@/models/settings';
import { readFileSync } from 'fs';
import JSON5 from 'json5';

export const settings: Settings = JSON5.parse(readFileSync('./user-assets/settings.json5', 'utf-8'));
