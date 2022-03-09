import React, { useEffect, useRef, useState } from 'react';
import { Button, ButtonProps, Tooltip } from 'antd';

export type AsyncButtonProps = {
    /**
     * The button onClick event. When the return value of the event function is a Promise the button will
     * be set in loading state until the Promise resolves
     */
    onClick: (evt: React.MouseEvent<HTMLElement>) => Promise<void> | void;
    /**
     * An optional toolip for the button
     */
    tooltip?: React.ReactNode;
} & Omit<ButtonProps, 'onClick' | 'loading'>;

/**
 * A React component implementing a button tied to an async action
 * @param props the component props
 */
export const AsyncButton = (props: AsyncButtonProps) => {
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const [loading, setLoading] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);

    const { onClick, ...buttonProps } = props;

    return (
        <Tooltip visible={tooltipVisible} title={props.tooltip}>
            <Button
                onClick={(evt) => {
                    setTooltipVisible(false);
                    const callbackReturn = onClick(evt);
                    if (callbackReturn) {
                        setLoading(true);
                        callbackReturn.finally(() => {
                            if (mounted.current) {
                                setLoading(false);
                            }
                        });
                    }
                }}
                onMouseEnter={(evt) => {
                    if (props.tooltip) {
                        setTooltipVisible(true);
                        if (props.onMouseEnter) {
                            props.onMouseEnter(evt);
                        }
                    }
                }}
                onMouseLeave={(evt) => {
                    setTooltipVisible(false);
                    if (props.onMouseLeave) {
                        props.onMouseLeave(evt);
                    }
                }}
                loading={loading}
                {...buttonProps}
            />
        </Tooltip>
    );
};
