import React from 'react';
import Icon from '@ant-design/icons';
export const SvgAdjustSolid = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        aria-hidden='true'
        data-icon='adjust'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 512 512'
        width='1em'
        height='1em'
        fill='currentColor'
        {...props}
    >
        <path
            fill='currentColor'
            d='M8 256c0 136.966 111.033 248 248 248s248-111.034 248-248S392.966 8 256 8 8 119.033 8 256zm248 184V72c101.705 0 184 82.311 184 184 0 101.705-82.311 184-184 184z'
        />
    </svg>
);
export const AdjustSolidIcon = (props: any) => <Icon component={SvgAdjustSolid} {...props} />;
