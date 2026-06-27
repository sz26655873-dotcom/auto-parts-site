#!/bin/bash
cd "$(dirname "$0")"
npx wrangler pages deploy dist --project-name=auto-parts-site --branch=y --commit-dirty=true
