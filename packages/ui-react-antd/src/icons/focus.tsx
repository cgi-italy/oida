import React from 'react';
import Icon from '@ant-design/icons';
export const SvgFocus = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 48 48' fill='currentColor' {...props}>
        <path
            d='M24 16c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM10 30H6v8c0 2.21 1.79 4 4 4h8v-4h-8v-8zm0-20h8V6h-8c-2.21 0-4 1.79-4 4v8h4v-8zm28-4h-8v4h8v8h4v-8c0-2.21-1.79-4-4-4zm0 32h-8v4h8c2.21 0 4-1.79 4-4v-8h-4v8z'
            className='focus_svg__nc-icon-wrapper'
        />
    </svg>
);
export const FocusIcon = (props: any) => <Icon component={SvgFocus} {...props} />;
