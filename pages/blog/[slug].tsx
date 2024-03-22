import React from 'react';
import { getMDXComponent } from 'mdx-bundler/client';
import { MDXProvider, components } from '@components/MDXComponents';
import { getAllFrontmatter, getMdxBySlug } from '@utils/mdx';
import type { Frontmatter } from 'types/frontmatter';
import { ThemesMDXComponents } from '@components/ThemesMDXComponents';
import { MobileMenuProvider } from '@components/MobileMenu';
import { Box, Flex, Link, Section, Text } from '@radix-ui/themes';
import { EditPageLink } from '@components/EditPageLink';
import { DocsPageWrapper } from '@components/DocsPageWrapper';
import { BlogHeader } from '@components/BlogHeader';
import { BlogMobileMenu } from '@components/BlogMobileMenu';
import { QuickNav } from '@components/QuickNav';
import NextLink from 'next/link';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

type BlogPost = {
  frontmatter: Frontmatter;
  code: string;
};

export default function BlogPost({ frontmatter, code }: BlogPost) {
  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <>
      <MobileMenuProvider>
        <BlogHeader />
        <BlogMobileMenu />

        <Flex>
          <Box
            px="7"
            width={'250px'}
            style={{ zIndex: 1 }}
            display={{ initial: 'none', md: 'block' }}
          >
            <Section size={{ initial: '2', md: '4' }}>
              <BackLink />
            </Section>
          </Box>

          <DocsPageWrapper>
            <Box>
              <Text color="gray" size="3" mb="6" as="div">
                {frontmatter.publishedAt}
              </Text>

              <MDXProvider frontmatter={frontmatter}>
                <Component components={ThemesMDXComponents as any} />
              </MDXProvider>
            </Box>

            <EditPageLink />
          </DocsPageWrapper>
        </Flex>
      </MobileMenuProvider>

      <QuickNav key={frontmatter.slug} title="In this article" />
    </>
  );
}

const BackLink = () => {
  return (
    <NextLink passHref legacyBehavior href={`/blog`}>
      <Flex asChild align="center" gap="3">
        <Link color="gray">
          <ArrowLeftIcon />
          Back to blog
        </Link>
      </Flex>
    </NextLink>
  );
};

export async function getStaticPaths() {
  const frontmatters = getAllFrontmatter('blog');

  return {
    paths: frontmatters.map((frontmatter) => ({
      params: { slug: frontmatter.slug.replace('blog/', '') },
    })),
    fallback: false,
  };
}

export async function getStaticProps(context) {
  const { frontmatter, code } = await getMdxBySlug('blog', context.params.slug);
  return { props: { frontmatter, code } };
}