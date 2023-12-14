import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoaderOnLayout from "components/LoaderOnLayout";
import { getDetailPurchaseOrder } from "api/gudang/purchase-order";
import FormTerimaPembelian from "components/modules/gudang/formTerimaPembelian";

const Confirm = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [isLoadingDataPurchaseOrder, setIsLoadingDataPurchaseOrder] =
    useState(true);
  const [dataPurchaseOrder, setDataPurchaseOrder] = useState({});

  useEffect(() => {
    if (router.isReady) {
      (async () => {
        try {
          const response = await getDetailPurchaseOrder({ id: slug[0] });
          const data = response.data.data;
          data = {
            ...data,
            purchase_order: { id: data.id, nomor_po: data.nomor_po },
            gudang: data.purchase_order_detail,
            receive_detail: data.purchase_order_detail,
          };
          setDataPurchaseOrder(data);
          console.log(data);
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoadingDataPurchaseOrder(false);
        }
      })();
    }
  }, [router.isReady, slug]);

  return (
    <>
      {isLoadingDataPurchaseOrder ? (
        <LoaderOnLayout />
      ) : (
        <>
          <h2 className="color-grey-text mt-0">Terima PO</h2>
          <FormTerimaPembelian
            isEditType
            prePopulatedDataForm={dataPurchaseOrder}
          />
        </>
      )}
    </>
  );
};

export default Confirm;
