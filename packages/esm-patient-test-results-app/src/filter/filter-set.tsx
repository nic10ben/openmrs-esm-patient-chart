import React, { useContext } from 'react';
import styles from './filter-set.styles.scss';
import { Accordion, AccordionItem, Checkbox, Button } from 'carbon-components-react';
import FilterContext from './filter-context';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import type { FilterNodeProps, FilterLeafProps } from './filter-types';
import { useTranslation } from 'react-i18next';
import { TreeViewAlt16, Search16 } from '@carbon/icons-react';

const isIndeterminate = (kids, checkboxes) => {
  return kids && !kids?.every((kid) => checkboxes[kid]) && !kids?.every((kid) => !checkboxes[kid]);
};

interface FilterSetProps {
  hideFilterSetHeader?: boolean;
}

const FilterSet: React.FC<FilterSetProps> = ({ hideFilterSetHeader = false }) => {
  const { roots } = useContext(FilterContext);
  const config = useConfig();
  const tablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();
  const { resetTree } = useContext(FilterContext);

  return (
    <div className={!tablet ? styles.stickyFilterSet : ''}>
      {!hideFilterSetHeader && (
        <div className={styles.filterSetHeader}>
          <h4>{t('tree', 'Tree')}</h4>
          <div className={styles.filterSetActions}>
            <Button kind="ghost" size="sm" renderIcon={Search16}>
              {t('search', 'Search')}
            </Button>

            <Button kind="ghost" size="sm" onClick={resetTree} renderIcon={TreeViewAlt16}>
              {t('resetTreeText', 'Reset tree')}
            </Button>
          </div>
        </div>
      )}
      <div className={styles.filterSetContent}>
        {roots?.map((root, index) => (
          <div className={styles.nestedAccordion}>
            <FilterNode root={root} level={0} open={config.concepts[index].defaultOpen} />
          </div>
        ))}
      </div>
    </div>
  );
};

const FilterNode = ({ root, level, open }: FilterNodeProps) => {
  const tablet = useLayoutType() === 'tablet';
  const { checkboxes, parents, updateParent } = useContext(FilterContext);
  const indeterminate = isIndeterminate(parents[root.flatName], checkboxes);
  const allChildrenChecked = parents[root.flatName]?.every((kid) => checkboxes[kid]);
  return (
    <Accordion align="start" size={tablet ? 'md' : 'sm'}>
      <AccordionItem
        title={
          <Checkbox
            id={root?.flatName}
            checked={root.hasData && allChildrenChecked}
            indeterminate={indeterminate}
            labelText={`${root?.display} (${parents?.[root?.flatName]?.length})`}
            onChange={() => updateParent(root.flatName)}
            disabled={!root.hasData}
          />
        }
        style={{ paddingLeft: `${level > 0 ? 1 : 0}rem` }}
        open={open ?? false}
      >
        {!root?.subSets?.[0]?.obs &&
          root?.subSets?.map((node, index) => <FilterNode root={node} level={level + 1} key={index} />)}
        {root?.subSets?.[0]?.obs && root.subSets?.map((obs, index) => <FilterLeaf leaf={obs} key={index} />)}
      </AccordionItem>
    </Accordion>
  );
};

const FilterLeaf = ({ leaf }: FilterLeafProps) => {
  const { checkboxes, toggleVal } = useContext(FilterContext);
  return (
    <div className={styles.filterItem}>
      <Checkbox
        id={leaf?.flatName}
        labelText={leaf?.display}
        checked={checkboxes?.[leaf.flatName]}
        onChange={() => toggleVal(leaf.flatName)}
        disabled={!leaf.hasData}
      />
    </div>
  );
};

export default FilterSet;
