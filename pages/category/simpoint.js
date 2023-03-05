import { Container } from "react-bootstrap";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import remarkFrontmatter from 'remark-frontmatter';
import CopyIcon from '@/components/copyIcon';
import simpoint from './simpoint.md'
import Link from "next/link";

export default function Simpoint() {
    return (
        <Container>
            <Link
                href="/resources?q=category:simpoint"
            >
                View all simpoints
            </Link>
            <ReactMarkdown
                className='markdown-body mt-3'
                rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }], rehypeRaw, rehypeSlug]}
                remarkPlugins={[remarkGfm, remarkToc, remarkFrontmatter]}
                components={{
                    pre: ({ node, ...props }) =>
                        <CopyIcon>
                            <pre {...props} >
                                {props.children}
                            </pre>
                        </CopyIcon>,
                }}
            >
                {simpoint}
            </ReactMarkdown>
        </Container>
    )
}