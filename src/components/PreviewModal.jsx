import Modal from './Modal';

export default function PreviewModal({ file, open, onClose, getPreviewUrl }) {
  if (!file) return null;
  const url = getPreviewUrl?.(file) || file.url || file.previewUrl || '';
  const name = file.name || file.key || '';

  const isImage = /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(name);
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(name);
  const isAudio = /\.(mp3|wav|ogg|flac|m4a)$/i.test(name);

  return (
    <Modal open={open} onClose={onClose} title={`预览：${name}`}>
      {url ? (
        isImage ? <img src={url} alt={name} style={{maxWidth:'100%', maxHeight:'60dvh'}}/> :
        isVideo ? <video src={url} controls style={{maxWidth:'100%', maxHeight:'60dvh'}}/> :
        isAudio ? <audio src={url} controls/> :
        <a href={url} target="_blank" rel="noreferrer">在新标签打开</a>
      ) : (
        <div>没有可用的预览 URL</div>
      )}
    </Modal>
  );
}
