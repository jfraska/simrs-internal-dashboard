import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoaderOnLayout from "components/LoaderOnLayout";
import FormMutation from "components/modules/gudang/formMutation";
import { getDetailMutasi } from "api/gudang/mutasi";

const Confirm = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [isLoadingDataMutation, setIsLoadingDataMutation] = useState(true);
  const [dataMutation, setDataMutation] = useState({});

  useEffect(() => {
    if (router.isReady) {
      (async () => {
        try {
          const response = await getDetailMutasi({ id: slug[0] });
          const data = response.data.data;
          setDataMutation(data);
          console.log(data);
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoadingDataMutation(false);
        }
      })();
    }
  }, [router.isReady, slug]);

  return (
    <>
      {isLoadingDataMutation ? (
        <LoaderOnLayout />
      ) : (
        <>
          <h2 className="color-grey-text mt-0">Terima Mutasi</h2>
          <FormMutation isEditType prePopulatedDataForm={dataMutation} />
        </>
      )}
    </>
  );
};

export default Confirm;
