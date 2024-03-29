import cn from 'classnames';
import {
  type FC,
  type ReactElement,
  type ReactNode,
  createContext,
  useContext,
} from 'react';

import Button from '../button';

interface TabLike {
  componentName?: 'Tabs' | 'TabList' | 'Tab' | 'TabPanels' | 'TabPanel';
}

interface TabLikeComponent<T> extends TabLike, FC<T> {}

interface TabLikeElement<T> extends ReactElement<T, TabLikeComponent<T>> {}

interface TabsContext extends Pick<TabsProps, 'activeTab' | 'onTabClick'> {}

const TabsContext = createContext<TabsContext | null>(null);

interface TabsProps {
  className?: string;
  activeTab: string;
  onTabClick: (tab: string) => void;
  children: [TabLikeElement<TabListProps>, TabLikeElement<TabPanelsProps>];
}

export const Tabs: TabLikeComponent<TabsProps> = ({
  className,
  activeTab,
  onTabClick,
  children,
}) => (
  <TabsContext.Provider
    value={{
      activeTab,
      onTabClick,
    }}
  >
    <div className={cn(className, 'flex flex-col')}>
      {children.find((child) => child.type.componentName === 'TabList')}
      {children.find((child) => child.type.componentName === 'TabPanels')}
    </div>
  </TabsContext.Provider>
);

Tabs.componentName = 'Tabs';

interface TabListProps {
  className?: string;
  children: TabLikeElement<TabProps>[];
  right?: ReactNode;
}

export const TabList: TabLikeComponent<TabListProps> = ({
  className,
  children,
  right = null,
}) => (
  <div
    className={cn(className, 'select-none flex justify-between items-center')}
  >
    <div className="flex flex-wrap">
      {children.filter((child) => child.type.componentName === 'Tab')}
    </div>

    {right ? <div className="flex child-[*]:mx-2">{right}</div> : null}
  </div>
);
TabList.componentName = 'TabList';

interface TabProps {
  id: string;
  hidden?: boolean;
  children: string;
}

export const Tab: TabLikeComponent<TabProps> = ({
  id,
  hidden = false,
  children,
}) => {
  const { activeTab, onTabClick } = useContext(TabsContext)!;

  const isActiveTab = id === activeTab;

  return (
    <Button
      as="span"
      className={cn('mx-2 my-1.5 px-2 py-1 rounded', {
        'text-[#0076cf] dark:text-[#2fafff]': isActiveTab,
        'text-[#5f5f5f] hover:text-[#0076cf] dark:text-[#b5b5b5] dark:hover:text-[#2fafff]':
          !isActiveTab,
        hidden,
      })}
      onClick={() => onTabClick(id)}
    >
      {children}
    </Button>
  );
};
Tab.componentName = 'Tab';

interface TabPanelsProps {
  className?: string;
  children: TabLikeElement<TabPanelProps>[];
}

export const TabPanels: TabLikeComponent<TabPanelsProps> = ({
  className,
  children,
}) => {
  const { activeTab } = useContext(TabsContext)!;

  return (
    <div className={cn(className, 'flex-one flex')}>
      {children
        .filter((child) => child.type.componentName === 'TabPanel')
        .map((tabPanel) => (
          <div
            key={tabPanel.props.id}
            className={cn({
              'flex-one flex': tabPanel.props.id === activeTab,
              hidden: tabPanel.props.id !== activeTab,
            })}
          >
            {tabPanel}
          </div>
        ))}
    </div>
  );
};
TabPanels.componentName = 'TabPanels';

interface TabPanelProps {
  id: string;
  children: ReactNode;
}

export const TabPanel: TabLikeComponent<TabPanelProps> = ({ children }) =>
  children;
TabPanel.componentName = 'TabPanel';

export default Tabs;
