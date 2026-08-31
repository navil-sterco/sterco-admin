import React, { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

export const ConfirmModal = forwardRef(function ConfirmModal(
  {
    title = 'Confirm',
    confirmLabel = 'Yes, Delete',
    processingLabel = 'Deleting...',
    cancelLabel = 'Cancel',
    processing = false,
    variant = 'danger',
  },
  ref
) {
  const elRef = useRef(null);
  const modalInstanceRef = useRef(null);
  const resolverRef = useRef(null);
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    if (window.bootstrap && elRef.current) {
      modalInstanceRef.current = new window.bootstrap.Modal(elRef.current);
    }

    const el = elRef.current;
    const handleHidden = () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };

    el?.addEventListener('hidden.bs.modal', handleHidden);
    return () => el?.removeEventListener('hidden.bs.modal', handleHidden);
  }, []);

  useImperativeHandle(ref, () => ({
    confirm: (opts = {}) => {
      if (opts.message !== undefined) setMessage(opts.message);
      modalInstanceRef.current?.show();
      return new Promise((resolve) => {
        resolverRef.current = resolve;
      });
    },
    hide: () => {
      modalInstanceRef.current?.hide();
    },
  }));

  const handleConfirmClick = () => {
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  return (
    <div className="modal fade" tabIndex="-1" aria-hidden="true" ref={elRef}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" disabled={processing}></button>
          </div>
          <div className="modal-body">{message}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={processing}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn btn-${variant}`}
              onClick={handleConfirmClick}
              disabled={processing}
            >
              {processing ? processingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
