import { DragHandleDots1Icon } from '@radix-ui/react-icons';
import React from 'react';

type HTMLProps = React.HTMLProps<HTMLDivElement>;

export function DragHandle(props: HTMLProps) {
	return (
		<div
			className="drag cursor-move flex items-center justify-center"
			{...props}
		>
			{/* <DragHandleVerticalIcon /> */}
			<DragHandleDots1Icon />
		</div>
	);
}
