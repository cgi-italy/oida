import React from 'react';
import { Icon } from 'antd';
export const SvgDrawLine = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        className='draw-line_svg__icon'
        height='1em'
        viewBox='0 0 1024 1024'
        width='1em'
        fill='currentColor'
        {...props}
    >
        <defs>
            <marker
                orient='auto'
                refY={0}
                refX={0}
                id='draw-line_svg__a'
                overflow='visible'
            >
                <path
                    d='M.98 0a1 1 0 11-2 0 1 1 0 012 0z'
                    fillRule='evenodd'
                    stroke='#000'
                    strokeWidth={0.2666}
                />
            </marker>
        </defs>
        <path
            d='M129.776 661.677l345.16-300.333 421.363 165.855'
            fill='none'
            stroke='#000'
            strokeWidth={62.96}
            strokeDasharray='0,692.56038615'
            markerStart='url(#draw-line_svg__a)'
            markerMid='url(#draw-line_svg__a)'
            markerEnd='url(#draw-line_svg__a)'
        />
        <path
            d='M132.118 666.807l345.16-300.333L898.64 532.33'
            fill='none'
            stroke='#000'
            strokeWidth={46.59}
        />
    </svg>
);
export const DrawLineIcon = (props: any) => (
    <Icon component={SvgDrawLine} {...props} />
);
