import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import { readFile } from 'fs/promises';
import path from 'path';
import { settings } from '@/server/get-settings';
import { getPropertyAsync, notionClient } from '@/libs/notion';

const Container = styled.div`
	min-height: 100vh;
	max-width: 1280px;
	margin: 0 auto;
`;

const Nav = styled.nav`
	display: grid;
	gap: var(--margin);
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
`;

const ArticleCard = styled.div`
	background: var(--tone-1);
	transition: box-shadow 0.1s ease, background 0.1s ease;
	border-radius: 16px;
	&:hover {
		background: var(--panel);
		box-shadow: 0 2px 24px rgba(0, 0, 0, 0.1);
		figure {
			img {
				transform: scale(120%);
			}
			&::before {
				opacity: 0;
			}
		}
	}
	figure {
		line-height: 1;
		overflow: hidden;
		&::before {
			opacity: 1;
			transition: opacity 0.1s ease;
			z-index: 5000;
		}
		img {
			transform-origin: center center;
			transition: transform 0.6s ease;
		}
	}
`;

const PlainAnchor = styled.a`
	color: inherit;
	text-decoration: none;
	cursor: pointer;
	&:hover {
		text-decoration: none;
	}
`;

type HomeProp = {
	host: string;
	title: string;
	subTitle?: string;
	copyright?: string;
	customCss?: string | null;
  posts: PostMetaData[];
};

type PostMetaData = {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt: string;
  category?: string | null;
  headerImage?: string | null;
};

const Home: NextPage<HomeProp> = (p) => {
	return (
		<Container className="container">
			<Head>
				<title>{p.title}</title>
				<meta name="description" content={p.subTitle} />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<link rel="icon" href="/favicon.ico" />
				{p.customCss && <style>{p.customCss}</style>}
			</Head>
			
			<header className="text-center py-5">
				<h1 className="text-bold">{p.title}</h1>
				<aside className="text-125 text-dimmed">{p.subTitle}</aside>
			</header>

			<Nav>
				{p.posts.map(p => (
					<PlainAnchor key={p.id}>
						<ArticleCard className="card shadow-2">
							<figure className="fluid bottom-shadow">
								{p.headerImage ? (
									<img src={p.headerImage} alt={p.title} />
								) : (
									<div className="flex f-center f-middle bg-gray-5" style={{width: '100%', height: 240}}>
										<i className="fas fa-image text-gray-9 text-400"></i>
									</div>
								)}
							</figure>
							<div className="body">
								<h1>{p.title}</h1>
								<p className="text-dimmed">Lorem ipsum dolor sit amet.</p>
								<aside className="text-75 text-dimmed">
									<i className="fas fa-clock" /> {p.updatedAt}
								</aside>
							</div>
						</ArticleCard>
					</PlainAnchor>
				))}
			</Nav>
			
			<footer className="text-center py-5 mt-auto text-gray-12">
				{p.copyright}
			</footer>
		</Container>
	);
};

export const getServerSideProps: GetServerSideProps<HomeProp> = async (ctx) => {
	const host = ctx.req.headers.host;
	const defaultSite = settings.sites.find(s => s.default) ?? settings.sites[0];
	const site = settings.sites.find(s => s.host === host) ?? defaultSite;
	const cssData = site.customCss ? (await readFile(path.join('./user-assets', site.customCss), 'utf-8')) : null;
	const db = await notionClient.databases.query({
		database_id: site.databaseId,
		filter: {
			property: 'ステータス',
			select: {
				equals: '公開', 
			}
		},
	});
	const posts: PostMetaData[] = await Promise.all(db.results.map(async p => {
		if (!('properties' in p)) throw new Error('properties not found');
		const [idRes, titleRes, categoryRes, createdAtRes, updatedAtRes, photoRes] = await Promise.all([
			getPropertyAsync(p, '記事ID'),
			getPropertyAsync(p, '記事タイトル'),
			getPropertyAsync(p, 'カテゴリ'),
			getPropertyAsync(p, '公開日時'),
			getPropertyAsync(p, '更新日時'),
			getPropertyAsync(p, 'アイキャッチ画像'),
		]);

		console.log(JSON.stringify(photoRes, null, '  '));

		// バリデーション
		if (idRes.type !== 'title') throw new TypeError(`prop type is ${idRes.type}`);
		if (titleRes.type !== 'rich_text') throw new TypeError(`prop type is ${titleRes.type}`);
		if (createdAtRes.type !== 'date') throw new TypeError(`prop type is ${createdAtRes.type}`);
		if (updatedAtRes.type !== 'last_edited_time') throw new TypeError(`prop type is ${updatedAtRes.type}`);
		if (photoRes.type !== 'files') throw new TypeError(`prop type is ${photoRes.type}`);
		if (categoryRes.type !== 'select') throw new TypeError(`prop type is ${categoryRes.type}`);

		const file = photoRes.files[0];
		const url = !file || !file.type ? null : 
			file.type === 'file' ? file.file.url :
				file.type === 'external' ? file.external.url : 
					null;
    
		return {
			id: idRes.title.plain_text,
			title: titleRes.rich_text.plain_text,
			createdAt: createdAtRes.date?.start,
			updatedAt: updatedAtRes.last_edited_time,
			category: categoryRes.select?.name,
			headerImage: url,
		};
	}));
	return {
		props: {
			title: site.title,
			subTitle: site.subTitle,
			copyright: site.copyright,
			host: site.host,
			customCss: cssData,
			posts,
		},
	};
};

export default Home;
