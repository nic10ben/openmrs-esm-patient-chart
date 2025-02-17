import React from 'react';
import { ArrowLeft16, Close16 } from '@carbon/icons-react';
import { Button, Header } from 'carbon-components-react';
import styles from './tablet-overlay.scss';

interface OverlayProps {
  close: () => void;
  headerText: string | React.ReactElement;
  buttonsGroup?: React.ReactElement;
}

const Overlay: React.FC<OverlayProps> = ({ close, children, headerText, buttonsGroup }) => (
  <div className={styles.tabletOverlay}>
    <Header className={styles.tabletOverlayHeader}>
      <Button onClick={close} hasIconOnly>
        <ArrowLeft16 onClick={close} />
      </Button>
      <div className={styles.headerContent}>{headerText}</div>
    </Header>
    <div className={styles.overlayContent}>{children}</div>
    <div className={styles.buttonsGroup}>{buttonsGroup}</div>
  </div>
);

export default Overlay;
