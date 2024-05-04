import { addArticleJsonLd } from '@starter-kit/utils/seo/addArticleJsonLd';
import { addPublicationJsonLd } from '@starter-kit/utils/seo/addPublicationJsonLd';
import {
	getAutogeneratedPostOG,
	getAutogeneratedPublicationOG,
} from '@starter-kit/utils/social/og';
import request from 'graphql-request';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRef } from 'react';
import { twJoin } from 'tailwind-merge';
import { Container } from '../components/container';
import { AppProvider } from '../components/contexts/appContext';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import { PostHeader } from '../components/post-header';
import PostPageNavbar from '../components/post-page-navbar';
// import PublicationFooter from '../components/publication-footer';
import StaticPageContent from '../components/static-page-content';
import {
	MorePostsByPublicationDocument,
	MorePostsEdgeFragment,
	PageByPublicationDocument,
	PostFullFragment,
	PublicationFragment,
	SinglePostByPublicationDocument,
	SlugPostsByPublicationDocument,
	StaticPageFragment,
} from '../generated/graphql';

type PostProps = {
	type: 'post';
	post: PostFullFragment;
	publication: PublicationFragment;
	morePosts: MorePostsEdgeFragment[];
};

type PageProps = {
	type: 'page';
	page: StaticPageFragment;
	publication: PublicationFragment;
};

type Props = PostProps | PageProps;

const Post = ({ publication, post, morePosts }: PostProps) => {
	const highlightJsMonokaiTheme =
		'.hljs{display:block;overflow-x:auto;padding:.5em;background:#23241f}.hljs,.hljs-subst,.hljs-tag{color:#f8f8f2}.hljs-emphasis,.hljs-strong{color:#a8a8a2}.hljs-bullet,.hljs-link,.hljs-literal,.hljs-number,.hljs-quote,.hljs-regexp{color:#ae81ff}.hljs-code,.hljs-section,.hljs-selector-class,.hljs-title{color:#a6e22e}.hljs-strong{font-weight:700}.hljs-emphasis{font-style:italic}.hljs-attr,.hljs-keyword,.hljs-name,.hljs-selector-tag{color:#f92672}.hljs-attribute,.hljs-symbol{color:#66d9ef}.hljs-class .hljs-title,.hljs-params{color:#f8f8f2}.hljs-addition,.hljs-built_in,.hljs-builtin-name,.hljs-selector-attr,.hljs-selector-id,.hljs-selector-pseudo,.hljs-string,.hljs-template-variable,.hljs-type,.hljs-variable{color:#e6db74}.hljs-comment,.hljs-deletion,.hljs-meta{color:#75715e}';

	return (
		<>
			<Head>
				<title>{post.seo?.title || post.title}</title>
				<link rel="canonical" href={post.url} />
				<meta name="description" content={post.seo?.description || post.subtitle || post.brief} />
				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:title" content={post.seo?.title || post.title} />
				<meta
					property="twitter:description"
					content={post.seo?.description || post.subtitle || post.brief}
				/>
				<meta
					property="og:image"
					content={
						post.ogMetaData?.image ||
						post.coverImage?.url ||
						getAutogeneratedPostOG(post, publication)
					}
				/>
				<meta
					property="twitter:image"
					content={
						post.ogMetaData?.image ||
						post.coverImage?.url ||
						getAutogeneratedPostOG(post, publication)
					}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(addArticleJsonLd(publication, post)),
					}}
				/>
				<style dangerouslySetInnerHTML={{ __html: highlightJsMonokaiTheme }}></style>
			</Head>
			<PostHeader post={post} morePosts={morePosts} />
		</>
	);
};

const Page = ({ page }: PageProps) => {
	const title = page.title;
	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>
			<div className="blog-page-area mx-auto min-h-screen px-4 py-8 md:w-2/3 md:p-10">
				<StaticPageContent pageContent={page} />
			</div>
		</>
	);
};

export default function PostOrPage(props: Props) {
	const headerRef = useRef<HTMLElement | null>(null);
	const maybePost = props.type === 'post' ? props.post : null;
	const maybePage = props.type === 'page' ? props.page : null;
	const publication = props.publication;
	const navPositionStyles =
		'relative transform-none md:sticky md:top-0 md:left-0 md:backdrop-blur-lg';

	if (props.type === 'post') {
		return (
			<AppProvider publication={publication} post={props.post}>
				<Layout>
					<header
						ref={headerRef}
						className={twJoin(
							'blog-header',
							'z-50 w-full border-b',
							navPositionStyles,
							'border-black/10 bg-white bg-opacity-70 dark:border-white/10 dark:bg-slate-900 dark:bg-opacity-70',
						)}
					>
						<PostPageNavbar publication={publication} ref={headerRef} />
					</header>
					<Container>
						<article className="flex flex-col items-start gap-10 pb-10">
							<Post {...props} />
						</article>
					</Container>
				</Layout>
			</AppProvider>
		);
	}

	const description =
		publication.descriptionSEO || publication.title || `${publication.author.name}'s Blog`;

	return (
		<AppProvider publication={publication} post={maybePost} page={maybePage}>
			<Layout>
				<Head>
					<title>
						{publication.displayTitle || publication.title || 'Hashnode Blog Starter Kit'}
					</title>
					<meta name="description" content={description} />
					<meta property="twitter:card" content="summary_large_image" />
					<meta
						property="twitter:title"
						content={publication.displayTitle || publication.title || 'Hashnode Blog Starter Kit'}
					/>
					<meta property="twitter:description" content={description} />
					<meta
						property="og:image"
						content={publication.ogMetaData.image || getAutogeneratedPublicationOG(publication)}
					/>
					<meta
						property="twitter:image"
						content={publication.ogMetaData.image || getAutogeneratedPublicationOG(publication)}
					/>
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(addPublicationJsonLd(publication)),
						}}
					/>
				</Head>
				<Header isHome={false} />
				<Container>
					<article className="flex flex-col items-start gap-10 pb-10">
						<Page {...props} />
					</article>
				</Container>
			</Layout>
		</AppProvider>
	);
}

type Params = {
	slug: string;
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
	if (!params) {
		throw new Error('No params');
	}

	const endpoint = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
	const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;
	const slug = params.slug;

	const [postData, morePostsData] = await Promise.all([
		request(endpoint, SinglePostByPublicationDocument, { host, slug }),
		request(endpoint, MorePostsByPublicationDocument, { first: 4, host }),
	]);

	if (postData.publication?.post) {
		return {
			props: {
				type: 'post',
				post: postData.publication.post,
				morePosts: morePostsData.publication?.posts.edges ?? [],
				publication: postData.publication,
			},
			revalidate: 1,
		};
	}

	const pageData = await request(endpoint, PageByPublicationDocument, { host, slug });

	if (pageData.publication?.staticPage) {
		return {
			props: {
				type: 'page',
				page: pageData.publication.staticPage,
				publication: pageData.publication,
			},
			revalidate: 1,
		};
	}

	return {
		notFound: true,
		revalidate: 1,
	};
};

export const getStaticPaths: GetStaticPaths = async () => {
	const data = await request(
		process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT,
		SlugPostsByPublicationDocument,
		{
			first: 10,
			host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
		},
	);

	const postSlugs = (data.publication?.posts.edges ?? []).map((edge) => edge.node.slug);

	return {
		paths: postSlugs.map((slug) => {
			return {
				params: {
					slug: slug,
				},
			};
		}),
		fallback: 'blocking',
	};
};
