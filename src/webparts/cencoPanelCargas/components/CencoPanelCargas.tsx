import * as React from "react";
import {
  Icon,
  Stack,
  mergeStyleSets,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
initializeIcons();

export interface ICencoPanelCargasProps {
  docsUrl: string;
  vehiclesUrl: string;
  peopleUrl: string;
  modal?: boolean;
}

type Action = {
  key: "docs" | "vehicles" | "people";
  label: string;
  iconName: string;
  url: string;
};

const PALETTE = {
  primary: "#0057A6",
  primaryLight: "#1976D2",
  primarySoft: "#E6F0FA",
  text: "#1E2A36",
  surface: "#FFFFFF",
};

const classes = mergeStyleSets({
  item: {
    width: "100%",
    maxWidth: 280,
  },
  tileBtn: {
    width: "90%",
    background: PALETTE.surface,
    borderRadius: 20,
    padding: "18px 14px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 6px 18px rgba(0, 87, 166, 0.12)",
    cursor: "pointer",
    userSelect: "none",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    border: `3px solid ${PALETTE.primaryLight}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 30,
    color: PALETTE.primary,
  },
  label: {
    fontSize: 15,
    fontWeight: 600,
    color: PALETTE.text,
  },
  // AHORA ES UN <dialog> REAL, NO UN DIV FIJO
  floatModal: {
    border: "none",
    borderRadius: 12,
    padding: 0,
    width: "70vw",
    maxWidth: "1100px",
    height: "90vh",
    maxHeight: "90vh",
    boxShadow: "0 10px 40px rgba(0,0,0,.25)",
  },
  floatModalContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  modalHeader: {
    padding: "10px 16px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalBody: {
    flex: 1,
    minHeight: 0,
    position: "relative",
  },
  iframe: {
    border: "none",
    width: "100%",
    height: "100%",
  },
  // backdrop ya NO se usa, pero lo dejo por si lo querés más tarde
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    zIndex: 3999,
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4100,
  },
  disabled: {
    opacity: 0.4,
    pointerEvents: "none",
  },
});

const forceDialogView = (rawUrl: string): string => {
  if (!rawUrl) return rawUrl;
  const hasQuery = rawUrl.indexOf("?") !== -1;
  const hasIsDlg = /[?&]IsDlg=1/i.test(rawUrl);
  if (hasIsDlg) return rawUrl;
  return hasQuery ? `${rawUrl}&IsDlg=1` : `${rawUrl}?IsDlg=1`;
};

const CencoPanelCargas: React.FC<ICencoPanelCargasProps> = (props) => {
  const [activeUrl, setActiveUrl] = React.useState<string | null>(null);
  const [activeLabel, setActiveLabel] = React.useState("");
  const [iframeVisible, setIframeVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);

  const onIframeLoad = (): void => {
    setLoading(false);

    try {
      const iframeEl = iframeRef.current;
      if (!iframeEl) return;

      const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
      if (!doc) return;

      const style = doc.createElement("style");
      style.innerHTML = `
        #s4-ribbonrow,
        #RibbonContainer,
        .ms-cui-topBar2,
        .ms-belltown-pageHeader,
        .o365cs-nav-header,
        .ms-breadcrumb-box {
          display: none !important;
        }
        html, body {
          overflow: auto !important;
        }
      `;
      doc.head.appendChild(style);
    } catch {
      // cross domain, lo ignoramos
    }
  };

  const actions: Action[] = [
    {
      key: "docs",
      label: "Documentos",
      iconName: "Upload",
      url: props.docsUrl,
    },
    {
      key: "vehicles",
      label: "Vehículos",
      iconName: "DeliveryTruck",
      url: props.vehiclesUrl,
    },
    {
      key: "people",
      label: "Personas",
      iconName: "Contact",
      url: props.peopleUrl,
    },
  ];

  const openAction = (url?: string, label?: string): void => {
    if (!url) return;

    if (!props.modal) {
      // redirección plana
      window.location.href = url;
      return;
    }

    const finalUrl = forceDialogView(url);
    setActiveUrl(finalUrl);
    setActiveLabel(label || "");
    setIframeVisible(true);
    setLoading(true);

    const dialog = dialogRef.current;
    if (dialog) {
      // Si soporta showModal, usamos modal real
      if (typeof dialog.showModal === "function") {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        // Fallback: se abre como dialog "no modal"
        dialog.setAttribute("open", "true");
      }
    }
  };

  const resetState = (): void => {
    setActiveUrl(null);
    setActiveLabel("");
    setIframeVisible(false);
    setLoading(false);
  };

  const onClose = (): void => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
    resetState();
  };

  const onDialogClose: React.FormEventHandler<HTMLDialogElement> = () => {
    // Se dispara cuando se cierra por ESC, clic en backdrop o dialog.close()
    resetState();
  };

  return (
    <>
      {/* Estilo del backdrop nativo del <dialog> */}
      <style>
        {`
          dialog::backdrop {
            background: rgba(0,0,0,.35);
          }
        `}
      </style>

      <Stack
        horizontal
        wrap={false}
        horizontalAlign="center"
        tokens={{ childrenGap: 14 }}
      >
        {actions.map((a) => {
          const disabled = !a.url;

          return (
            <Stack.Item key={a.key} className={classes.item}>
              <div
                className={`${classes.tileBtn} ${
                  disabled ? classes.disabled : ""
                }`}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && openAction(a.url, a.label)}
                onKeyDown={(ev) => {
                  if (!disabled && (ev.key === "Enter" || ev.key === " ")) {
                    ev.preventDefault();
                    openAction(a.url, a.label);
                  }
                }}
                title={disabled ? "Configure la URL en propiedades" : a.label}
              >
                <div className={classes.iconCircle}>
                  <Icon iconName={a.iconName} className={classes.icon} />
                </div>
                <div className={classes.label}>{a.label}</div>
              </div>
            </Stack.Item>
          );
        })}
      </Stack>

      {props.modal && (
        <dialog
          ref={dialogRef}
          className={classes.floatModal}
          onClose={onDialogClose}
        >
          <div className={classes.floatModalContent}>
            <div className={classes.modalHeader}>
              <span>{activeLabel || "Detalle"}</span>
              <button
                onClick={onClose}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <Icon iconName="ChromeClose" />
              </button>
            </div>
            <div className={classes.modalBody}>
              {activeUrl && (
                <iframe
                  ref={iframeRef}
                  src={activeUrl}
                  onLoad={onIframeLoad}
                  className={classes.iframe}
                  style={{ display: iframeVisible ? "block" : "none" }}
                />
              )}

              {loading && (
                <div className={classes.loadingOverlay}>
                  <Spinner label="Cargando..." size={SpinnerSize.large} />
                </div>
              )}
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default CencoPanelCargas;
