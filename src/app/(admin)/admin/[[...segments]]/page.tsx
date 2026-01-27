/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import configPromise from '@/payload.config';
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import type { Metadata } from 'next';
import { importMap } from '../importMap';

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export async function generateMetadata({ params, searchParams }: Args): Promise<Metadata> {
  return generatePageMetadata({ config: configPromise, params, searchParams });
}

export default function Page({ params, searchParams }: Args) {
  return RootPage({ config: configPromise, params, searchParams, importMap });
}
