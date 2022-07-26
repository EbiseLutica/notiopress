import { settings } from '@/server/get-settings';
import { Client, LogLevel } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const notionClient = new Client({
	auth: settings.notionToken,
	notionVersion: '2022-06-28',
});

export const getPropertyAsync = async (page: PageObjectResponse, propertyName: string) => {
	return await notionClient.pages.properties.retrieve({
		page_id: page.id,
		property_id: page.properties[propertyName].id,
	});
};