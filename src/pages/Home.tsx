import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';

import { GeneralLayout } from '../components/general_layout';
import { Logo } from '../components/common/logo';
import { ToolbarContainer as Toolbar } from '../components/common/toolbar';

const Home = () => {
    return (
        <GeneralLayout toolbar={<Toolbar startContent={<Logo image={<div>🚀</div>} text="Exchange" onClick={() => { }} />} endContent={<ConnectButton />} />}>
            <div>
                <h1>Hello Exchange</h1>
            </div>
        </GeneralLayout>
    );
};

export default Home;
