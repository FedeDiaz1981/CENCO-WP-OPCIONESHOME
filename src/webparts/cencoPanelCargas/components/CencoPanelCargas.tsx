import * as React from "react";
import {
  Icon,
  Stack,
  mergeStyleSets,
  Modal,
} from "@fluentui/react";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
initializeIcons();

export interface ICencoPanelCargasProps {
  docsUrl: string;
  vehiclesUrl: string;
  peopleUrl: string;
}

type Action = {
  key: "docs" | "vehicles" | "people";
  label: string;
  iconName: string;
  url: string;
};

const HEADER_HEIGHT_PX = 50;
const MODAL_HEIGHT_VH = 90;

const PALETTE = {
  primary: "#0057A6",
  primaryLight: "#1976D2",
  primarySoft: "#E6F0FA",
  accent: "#F36C21",
  text: "#1E2A36",
  surface: "#FFFFFF",
  surfaceSoft: "#F7F9FB",
};

const classes = mergeStyleSets({
  item: {
    width: "100%",
    maxWidth: 280,
  },

  iframeWrapper: {
    width: "90vw",
    maxWidth: "1200px",
    height: `${MODAL_HEIGHT_VH}vh`,
    maxHeight: `${MODAL_HEIGHT_VH}vh`,
    backgroundColor: "white",
    borderRadius: 0,                // ⬅️ sin bordes redondeados
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 48px rgba(0,0,0,.25), 0 4px 16px rgba(0,0,0,.15)",
  },

  tileBtn: {
    width: "100%",
    border: "none",
    outline: "none",
    background: PALETTE.surface,
    borderRadius: 20,
    padding: "18px 14px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 6px 18px rgba(0, 87, 166, 0.12)",
    cursor: "pointer",
    transition:
      "transform 0.12s ease-out, box-shadow 0.12s ease-out, background 0.12s ease-out",
    minHeight: 150,
    ":hover": {
      background: PALETTE.primarySoft,
      transform: "translateY(-2px)",
      boxShadow: "0 10px 28px rgba(0, 87, 166, 0.14)",
    },
    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.4,
      transform: "none",
      boxShadow: "none",
    },
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.7)",
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

  modalOuter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    backgroundColor: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(2px)",
  },

  modalHeader: {
    height: `${HEADER_HEIGHT_PX}px`,
    flexShrink: 0,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, #0057A6 0%, #1976D2 100%)",
    color: "#fff",
    fontWeight: 600,
    letterSpacing: 0.2,
  },

  closeBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.4)",
    width: 30,
    height: 30,
    borderRadius: "50%",
    cursor: "pointer",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    transition: "background .12s ease-out, transform .12s ease-out",
    ":hover": {
      background: "rgba(255,255,255,0.15)",
      transform: "rotate(4deg)",
    },
  },

  iframeScrollArea: {
    flexShrink: 1,
    flexGrow: 0,
    minHeight: 0,
    height: `calc(${MODAL_HEIGHT_VH}vh - ${HEADER_HEIGHT_PX}px)`,
    overflowY: "auto",
    backgroundColor: "#F7F9FB",       // mismo fondo que el modal
    display: "flex",
    flexDirection: "column",
  },

  iframe: {
    border: "none",
    width: "100%",
    minHeight: "100%",                // ocupa todo el alto disponible
    backgroundColor: "#F7F9FB",       // por si no carga la página
    display: "block",
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
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [activeUrl, setActiveUrl] = React.useState<string | null>(null);
  const [activeLabel, setActiveLabel] = React.useState<string>("");
  const [showFrame, setShowFrame] = React.useState<boolean>(false); // ⬅️ nuevo

  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  const actions: Action[] = [
    { key: "docs", label: "Documentos", iconName: "Upload",        url: props.docsUrl },
    { key: "vehicles", label: "Vehículos",  iconName: "DeliveryTruck", url: props.vehiclesUrl },
    { key: "people", label: "Personas",   iconName: "Contact",       url: props.peopleUrl },
  ];

  const openInModal = (url?: string, label?: string) => {
    if (!url) return;
    setActiveUrl(forceDialogView(url));
    setActiveLabel(label || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveUrl(null);
    setActiveLabel("");
    setShowFrame(false); // ⬅️ limpiamos cuando cerramos
  };

  // ⬅️ montaje diferido del iframe
  React.useEffect(() => {
    if (isModalOpen) {
      const t = setTimeout(() => setShowFrame(true), 60);
      return () => clearTimeout(t);
    }
  }, [isModalOpen]);

  const onIframeLoad = () => {
    const iframeEl = iframeRef.current;
    if (!iframeEl) return;

    try {
      const iframeDoc =
        iframeEl.contentDocument || iframeEl.contentWindow?.document;
      if (!iframeDoc) return;

      const styleTag = iframeDoc.createElement("style");
      styleTag.innerHTML = `
        #s4-ribbonrow, #RibbonContainer, .ms-cui-topBar2,
        .ms-cui-ribbonTopBars, .ms-belltown-pageHeader,
        .o365cs-nav-header, .ms-breadcrumb-box {
          display: none !important;
        }
        body, #s4-workspace, #contentBox, #DeltaPlaceHolderMain {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
      `;
      iframeDoc.head.appendChild(styleTag);
      iframeEl.contentWindow?.scrollTo(0, 0);
    } catch {
      /* cross origin */
    }
  };

  return (
    <>
      <Stack
        horizontal
        wrap={false}
        horizontalAlign="center" 
        verticalAlign="stretch"
        tokens={{ childrenGap: 14 }}
        styles={{ root: { width: "100%", margin: "0 auto" } }}
      >
        {actions.map((a) => {
          const disabled = !a.url;
          return (
            <Stack.Item key={a.key} className={classes.item}>
              <button
                className={classes.tileBtn}
                onClick={() => openInModal(a.url, a.label)}
                disabled={disabled}
                title={disabled ? "Configura la URL en propiedades" : a.label}
              >
                <div className={classes.iconCircle}>
                  <Icon iconName={a.iconName} className={classes.icon} />
                </div>
                <div className={classes.label}>{a.label}</div>
              </button>
            </Stack.Item>
          );
        })}
      </Stack>

      <Modal
        isOpen={isModalOpen}
        onDismiss={closeModal}
        isBlocking={true}
        containerClassName={classes.modalOuter}
        layerProps={{ className: classes.overlay }}   // ⬅️ acá va el overlay
      >
        <div className={classes.iframeWrapper}>
          <div className={classes.modalHeader}>
            <span>{activeLabel}</span>
            <button
              onClick={closeModal}
              className={classes.closeBtn}
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
          <div className={classes.iframeScrollArea}>
            {showFrame && activeUrl && (
              <iframe
                ref={iframeRef}
                src={activeUrl}
                className={classes.iframe}
                onLoad={onIframeLoad}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CencoPanelCargas;
