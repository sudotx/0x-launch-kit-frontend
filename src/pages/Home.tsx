
import { ToolbarContentContainer } from '../components/erc20/common/toolbar_content';
import { Marketplace } from '../components/erc20/marketplace';
import { GeneralLayout } from '../components/general_layout';

const Home = () => {
    return (
        <GeneralLayout toolbar={<ToolbarContentContainer />}>
            <Marketplace />
        </GeneralLayout>
    );
};

export default Home;