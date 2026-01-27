/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import configPromise from '@/payload.config';
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views';
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

export default function NotFound({ params, searchParams }: Args) {
  return NotFoundPage({ config: configPromise, params, searchParams, importMap });
}
