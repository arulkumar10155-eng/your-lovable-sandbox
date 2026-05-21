import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';

type MediaKind = 'image' | 'video' | 'audio' | 'pdf' | 'other';

const detectKind = (url: string): MediaKind => {
  const u = url.toLowerCase().split('?')[0];
  if (/\.(png|jpe?g|webp|gif|bmp|svg|heic)$/.test(u)) return 'image';
  if (/\.(mp4|webm|mov|m4v|ogv)$/.test(u)) return 'video';
  if (/\.(mp3|wav|m4a|aac|ogg|oga)$/.test(u)) return 'audio';
  if (/\.pdf$/.test(u)) return 'pdf';
  return 'other';
};

interface Props {
  url: string;
  filename?: string;
  onClose: () => void;
  kindHint?: MediaKind;
}

const MediaPreviewModal: React.FC<Props> = ({ url, filename, onClose, kindHint }) => {
  useLockBodyScroll(true);
  const kind = kindHint || detectKind(url);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-white">
        <div className="truncate text-xs opacity-80">{filename || url.split('/').pop()}</div>
        <div className="flex items-center gap-1 shrink-0">
          <a href={url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
          <a href={url} download onClick={e => e.stopPropagation()}>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
              <Download className="w-4 h-4" />
            </Button>
          </a>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-3 overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {kind === 'image' && (
          <img src={url} alt={filename || ''} className="max-w-full max-h-full object-contain rounded" />
        )}
        {kind === 'video' && (
          <video src={url} controls autoPlay className="max-w-full max-h-full rounded" />
        )}
        {kind === 'audio' && (
          <audio src={url} controls autoPlay className="w-full max-w-md" />
        )}
        {kind === 'pdf' && (
          <iframe src={url} title="PDF" className="w-full h-full bg-white rounded" />
        )}
        {kind === 'other' && (
          <div className="bg-white rounded-lg p-6 text-center max-w-sm">
            <p className="text-sm mb-3">This file type can't be previewed inline.</p>
            <a href={url} target="_blank" rel="noreferrer">
              <Button variant="default">Open file</Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPreviewModal;
