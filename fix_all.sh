#!/bin/bash
# Update QrFerry.tsx
sed -i 's/className="w-full aspect-video max-w-5xl/className="w-full h-[70vh] md:aspect-video md:h-auto max-w-5xl/g' src/pages/QrFerry.tsx
# Update KyroRhythm.tsx
sed -i 's/className="w-full aspect-video max-w-5xl/className="w-full h-[70vh] md:aspect-video md:h-auto max-w-5xl/g' src/pages/KyroRhythm.tsx
# Update Chatify.tsx
sed -i 's/className="w-full aspect-video max-w-5xl/className="w-full h-[70vh] md:aspect-video md:h-auto max-w-5xl/g' src/pages/Chatify.tsx
