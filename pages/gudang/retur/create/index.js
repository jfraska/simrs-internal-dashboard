import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPembelian, getDetailPembelian } from "api/gudang/pembelian";
import TableLayoutGudang from "components/TableLayoutGudang";
import LoaderOnLayout from "components/LoaderOnLayout";
import Snackbar from "components/SnackbarMui";
import { Card, CardContent, Button, Dialog } from "@mui/material";
import BackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TableLayoutDetailGudang from "components/TableLayoutDetailGudang";
import FormRetur from "components/modules/gudang/formRetur";
import { forEach } from "lodash";

const daftarPembelianTableHead = [
  {
    id: "nomor_faktur",
    label: "Nomor Faktur",
  },
  {
    id: "supplier",
    label: "Supplier",
  },
  {
    id: "gudang",
    label: "Gudang",
  },
];

const dataPembelianFormatHandler = (payload) => {
  const result = payload.map((e) => {
    return {
      nomor_faktur: e.nomor_faktur || "null",
      supplier: e.supplier || "null",
      gudang: e.gudang || "null",
      id: e.id,
    };
  });
  return result;
};

const daftarItemTableHead = [
  {
    id: "checkbox",
    label: "",
  },
  {
    id: "nomor_batch",
    label: "Nomor Batch",
  },
  {
    id: "item_kode",
    label: "Kode Item",
  },
  {
    id: "item_name",
    label: "Nama Item",
  },
  {
    id: "sediaan",
    label: "Sediaan",
  },
  {
    id: "tanggal_ed",
    label: "Expired Date",
  },
];

const dataItemFormatHandler = (payload) => {
  const result = payload.map((e) => {
    return {
      item_kode: e.item.kode || "null",
      item_name: e.item.name || "null",
      sediaan: e.item.sediaan.name || "null",
      nomor_batch: e.nomor_batch || "null",
      tanggal_ed: e.tanggal_ed || "null",
      id: e.id,
    };
  });
  return result;
};

const Create = () => {
  const router = useRouter();
  const [snackbarState, setSnackbarState] = useState({
    state: false,
    type: null,
    message: "",
  });
  const [dialogFormState, setDialogFormState] = useState(false);

  // Pembelian --general state
  const [dataPembelian, setDataPembelian] = useState([]);
  const [dataMetaPembelian, setDataMetaPembelian] = useState({});
  const [dataPembelianPerPage, setDataPembelianPerPage] = useState(8);
  const [isLoadingDataPembelian, setIsLoadingDataPembelian] = useState(false);
  const [isUpdatingDataPembelian, setIsUpdatingDataPembelian] = useState(false);
  // Item --general state
  const [dataItem, setDataItem] = useState({});
  const [dataDetailItem, setDataDetailItem] = useState([]);
  const [selectDataItem, setSelectDataItem] = useState();
  const [isLoadingDataItem, setIsLoadingDataItem] = useState(false);

  // Pembelian --general handler
  const initDataPembelian = async () => {
    try {
      setIsLoadingDataPembelian(true);
      const params = {
        per_page: dataPembelianPerPage,
      };
      const response = await getPembelian(params);
      const result = dataPembelianFormatHandler(response.data.data);
      setDataPembelian(result);
      setDataMetaPembelian(response.data.meta);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingDataPembelian(false);
    }
  };

  const updateDataPembelianHandler = async (payload) => {
    try {
      setIsUpdatingDataPembelian(true);
      const response = await getPembelian(payload);
      const result = dataPembelianFormatHandler(response.data.data);
      setDataPembelian(result);
      setDataMetaPembelian(response.data.meta);
    } catch (error) {
      console.log(error);
      setSnackbarState({
        state: true,
        type: "error",
        message: error.message,
      });
    } finally {
      setIsUpdatingDataPembelian(false);
    }
  };

  const searchDataPembelianHandler = async (payload) => {
    try {
      setIsUpdatingDataPembelian(true);
      const response = await searchPembelian({
        search_text: payload.map((e) => e.value),
        search_column: payload.map((e) => e.type),
        per_page: dataPembelianPerPage,
      });
      if (response.data.data.length !== 0) {
        const result = dataPembelianFormatHandler(response.data.data);
        setDataPembelian(result);
        setDataMetaPembelian(response.data.meta);
      } else {
        setSnackbarState({
          state: true,
          type: "warning",
          message: `${payload} tidak ditemukan`,
        });
        const response = await getPembelian({
          per_page: dataPembelianPerPage,
        });
        const result = dataPembelianFormatHandler(
          response.data.data.receive_detail
        );
        setDataPembelian(result);
        setDataMetaPembelian(response.data.meta);
      }
    } catch (error) {
      setSnackbarState({
        state: true,
        type: "error",
        message: error.message,
      });
    } finally {
      setIsUpdatingDataPembelian(false);
    }
  };

  const onDoubleClickHandler = async (payload) => {
    try {
      setIsLoadingDataItem(true);
      console.log(payload);
      const response = await getDetailPembelian({ id: payload });
      const result = dataItemFormatHandler(response.data.data.gudang);
      setDataItem(response.data.data);
      setDataDetailItem(result);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingDataItem(false);
    }
  };

  const selectedHandler = (payload) => {
    let tempData = [];
    payload.forEach((e) => {
      const data = {
        gudang: dataItem.gudang[e],
        jumlah: null,
        alasan: "",
      };
      tempData.push(data);
    });
    setSelectDataItem({
      receive_id: {
        id: dataItem.id,
        nomor_faktur: dataItem.nomor_faktur,
        supplier: dataItem.purchase_order.supplier.name,
        gudang: dataItem.purchase_order.gudang,
        potype: dataItem.purchase_order.potype.name,
      },
      retur_detail: tempData,
    });
    console.log(selectDataItem);
  };

  useEffect(() => {
    initDataPembelian();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoadingDataPembelian ? (
        <LoaderOnLayout />
      ) : (
        <>
          <h2 className="color-grey-text mt-0">Tambah Retur Baru</h2>
          <div style={{ display: "flex" }}>
            <Card style={{ flex: 2, padding: "20px", marginRight: "5px" }}>
              <CardContent>
                <TableLayoutGudang
                  baseRoutePath={`${router.asPath}`}
                  title="Daftar Pembelian"
                  isBtnAdd={false}
                  isShow={false}
                  tableHead={daftarPembelianTableHead}
                  data={dataPembelian}
                  meta={dataMetaPembelian}
                  dataPerPage={dataPembelianPerPage}
                  isUpdatingData={isUpdatingDataPembelian}
                  filterOptions={[
                    { label: "Nomor Faktur", value: "nomor_faktur" },
                    { label: "Supplier", value: "supplier" },
                  ]}
                  onDoubleClick={onDoubleClickHandler}
                  updateDataPerPage={(e, filter) => {
                    const searchParams = filter.reduce((obj, e) => {
                      obj[e.type] = e.value;
                      return obj;
                    }, {});

                    setDataPerPage(e.target.value);
                    updateDataPembelianHandler({
                      per_page: e.target.value,
                      search: searchParams,
                    });
                  }}
                  updateDataNavigate={(payload) =>
                    updateDataPembelianHandler({
                      per_page: dataPembelianPerPage,
                      cursor: payload,
                    })
                  }
                  refreshData={() =>
                    updateDataPembelianHandler({
                      per_page: dataPembelianPerPage,
                    })
                  }
                  searchData={searchDataPembelianHandler}
                />
              </CardContent>
            </Card>
            <Card style={{ flex: 1, padding: "20px" }}>
              <CardContent>
                {isLoadingDataItem ? (
                  <LoaderOnLayout />
                ) : (
                  <>
                    <TableLayoutDetailGudang
                      baseRoutePath={`${router.asPath}`}
                      title="Daftar Item"
                      isEditType
                      isCheckbox={"multiple"}
                      checkboxHandler={selectedHandler}
                      tableHead={daftarItemTableHead}
                      data={dataDetailItem}
                    />

                    <div className="flex justify-end items-center mt-16">
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<BackIcon />}
                        sx={{ marginRight: 2 }}
                        onClick={() => router.push("/gudang/retur")}
                      >
                        Kembali
                      </Button>
                      {selectDataItem && (
                        <Button
                          type="button"
                          variant="outlined"
                          endIcon={<ArrowForwardIcon />}
                          sx={{ marginRight: 2 }}
                          onClick={() => setDialogFormState(true)}
                        >
                          Lanjutkan
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
      <Dialog
        fullScreen
        open={dialogFormState}
        onClose={() => setDialogFormState(false)}
      >
        <FormRetur
          isEditType
          prePopulatedDataForm={selectDataItem}
          handleClose={() => setDialogFormState(false)}
        />
      </Dialog>
      <Snackbar
        state={snackbarState.state}
        setState={(payload) =>
          setSnackbarState({
            state: payload,
            type: null,
            message: "",
          })
        }
        message={snackbarState.message}
        isSuccessType={snackbarState.type === "success"}
        isErrorType={snackbarState.type === "error"}
        isWarningType={snackbarState.type === "warning"}
      />
    </>
  );
};

export default Create;
