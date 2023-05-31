import React from 'react';
import TreeItemFHG from './TreeItemFHG';

export default function TreeViewFHG({
   defaultExpanded,
   expandAll = false,
   ContentComponent,
   EditComponent,
   height,
   width,
   onAdd,
   onEdit,
   onDelete,
   onMove,
   onMoveX,
   item,
   itemsKey = 'items',
   labelKey = 'label',
   parentKey,
}) {
   return (
      <TreeItemFHG
         key={'TreeView' + item?.id}
         ContentComponent={ContentComponent}
         height={height}
         width={width}
         defaultExpanded={defaultExpanded}
         expandAll={expandAll}
         EditComponent={EditComponent}
         item={item}
         itemsKey={itemsKey}
         labelKey={labelKey}
         parentKey={parentKey}
         onMoveX={onMoveX}
         onMove={onMove}
         onEdit={onEdit}
         onAdd={onAdd}
         onDelete={onDelete}
      />
   );
}
