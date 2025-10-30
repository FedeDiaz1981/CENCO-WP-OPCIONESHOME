import * as React from "react";
import styles from "./CencoPanelCargas.module.scss";
import { Icon, Stack, mergeStyleSets } from "@fluentui/react";
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

// Breakpoints con Fluent (CSS-in-JS)
const classes = mergeStyleSets({
  grid: {
    width: "100%",
  },
  // Cada item ocupa 100% en mobile, 50% en ≥640px, 33.33% en ≥1024px
  item: {
    width: "100%",
    "@media (min-width: 640px)": { maxWidth: "calc(50% - 8px)" },
    "@media (min-width: 1024px)": { maxWidth: "calc(33.333% - 10.66px)" },
  },
});

const CencoPanelCargas: React.FC<ICencoPanelCargasProps> = (props) => {
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

  const open = (url?: string) => url && window.open(url, "_blank", "noopener");

  return (
    <Stack
      horizontal
      wrap={false}
      verticalAlign="stretch"
      tokens={{ childrenGap: 16 }}
      className={styles.container}
    >
      {actions.map((a) => {
        const disabled = !a.url;
        return (
          <Stack.Item key={a.key} className={classes.item}>
            <button
              className={`${styles.tile} ${disabled ? styles.disabled : ""}`}
              onClick={() => open(a.url)}
              title={disabled ? "Configura la URL en propiedades" : a.label}
              disabled={disabled}
              aria-label={a.label}
            >
              <div className={styles.iconWrap}>
                <Icon iconName={a.iconName} className={styles.icon} />
              </div>
              <div className={styles.label}>{a.label}</div>
            </button>
          </Stack.Item>
        );
      })}
    </Stack>
  );
};

export default CencoPanelCargas;
