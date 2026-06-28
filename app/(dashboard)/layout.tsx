import Protected from '@/components/Wrappers/Protected'
import TradeDataProvider from '@/components/Wrappers/TradeDataProvider'
import React from 'react'

const Layout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <Protected>
            <TradeDataProvider>
                {children}
            </TradeDataProvider>
        </Protected>
    )
}

export default Layout
