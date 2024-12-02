import NameInput from '@/components/NameInput';
import NameInput2 from '@/components/NameInput2';
import DataUpdateExample from '@/components/DataUpdateExample';
import RefreshButton from '@/components/RefreshButton';

export default function HomeScreen() {
  return (
    <>
      <NameInput />
      <NameInput2 />
      <DataUpdateExample />
      <RefreshButton />
    </>
  );
}