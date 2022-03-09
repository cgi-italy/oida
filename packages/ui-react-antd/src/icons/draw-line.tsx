import React from 'react';
import Icon from '@ant-design/icons';
export const SvgDrawLine = (props: React.SVGProps<SVGSVGElement>) => (
    <svg className='draw-line_svg__icon' height='1em' viewBox='0 0 1024 1024' width='1em' fill='currentColor' {...props}>
        <path d='M104.875 272.812a67.288 67.288 0 0 0-66.937 67.313 67.288 67.288 0 0 0 67.25 67.25 67.288 67.288 0 0 0 14-1.5L300.562 705.75a67.288 67.288 0 0 0-15.5 43A67.288 67.288 0 0 0 352.375 816a67.288 67.288 0 0 0 67.25-67.25 67.288 67.288 0 0 0-.25-5.562l414.75-183.5a67.288 67.288 0 0 0 49.188 21.437 67.288 67.288 0 0 0 67.312-67.312 67.288 67.288 0 0 0-67.312-67.25A67.288 67.288 0 0 0 816 513.813a67.288 67.288 0 0 0 .25 5.5l-414.688 183.5a67.288 67.288 0 0 0-49.187-21.375 67.288 67.288 0 0 0-14 1.5L157 383.062a67.288 67.288 0 0 0 15.5-42.937 67.288 67.288 0 0 0-67.312-67.313 67.288 67.288 0 0 0-.313 0z' />
    </svg>
);
export const DrawLineIcon = (props: any) => <Icon component={SvgDrawLine} {...props} />;
