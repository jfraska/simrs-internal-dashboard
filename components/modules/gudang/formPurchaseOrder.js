import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FocusError } from "focus-formik-error";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";
import BackIcon from "@material-ui/icons/ArrowBack";
import DoneIcon from "@mui/icons-material/Done";
import { parse } from "date-fns";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import { formatIsoToGen, formatGenToIso } from "utils/formatTime";
import { useFormik } from "formik";
import * as Yup from "yup";
import { stringSchema } from "utils/yupSchema";
import Snackbar from "components/SnackbarMui";
import { createPurchaseOrder } from "api/gudang/purchase-order";
import SelectAsync from "components/SelectAsync";
import { getPoType } from "api/gudang/po-type";
import { getSupplier } from "api/supplier";
import { jenisGudang } from "public/static/data";
import useClientPermission from "custom-hooks/useClientPermission";
import { filterFalsyValue, convertDataDetail } from "utils/helper";
import { Divider, Typography, Button, Paper } from "@mui/material";
import DialogAddItem from "./dialogAddItemPurchaseOrder";
import TableLayoutDetailGudang from "components/TableLayoutDetailGudang";

const detailPoTableHead = [
  {
    id: "kode_item",
    label: "Kode Item",
  },
  {
    id: "nama_item",
    label: "Nama Item",
  },
  {
    id: "jumlah",
    label: "Jumlah",
  },
  {
    id: "satuan",
    label: "Satuan",
  },
];

const dataDetailFormatHandler = (payload) => {
  const result = payload.map((e) => {
    return {
      kode_item: e.item.kode || "null",
      nama_item: e.item.name,
      jumlah: e.jumlah || "null",
      satuan: e.sediaan.name || "null",
      id: e.id || e,
    };
  });
  return result;
};

const FormPurchaseOrder = () => {
  const router = useRouter();
  const { isActionPermitted } = useClientPermission();
  const [snackbar, setSnackbar] = useState({
    state: false,
    type: null,
    message: "",
  });
  const [dataDetail, setDataDetail] = useState([]);
  const [dataDetailEdit, setDataDetailEdit] = useState({});
  const [isDialogItem, setIsDialogItem] = useState({
    state: false,
    edit: false,
  });

  const purchaseOrderInitialValues = {
    nomor_po: "",
    potype: { kode: "", name: "" },
    tanggal_po: null,
    supplier: { id: "", name: "" },
    gudang: { id: "", name: "" },
    keterangan: "",
    purchase_order_detail: [],
  };

  const createPurchaseOrderSchema = Yup.object({
    potype: Yup.object({
      kode: stringSchema("Jenis Surat", true),
    }),
    nomor_po: Yup.string(),
    tanggal_po: Yup.date()
      .transform(function (value, originalValue) {
        if (this.isType(value)) {
          return value;
        }
        const result = parse(originalValue, "dd/MM/yyyy", new Date());
        return result;
      })
      .typeError("Tanggal PO tidak valid")
      .min("2023-01-01", "Tanggal PO tidak valid")
      .required("Tanggal PO wajib diisi"),
    supplier: Yup.object({
      id: stringSchema("Supplier", true),
    }),
    gudang: Yup.object({
      id: stringSchema("Gudang", true),
    }),
    purchase_order_detail: Yup.array(),
  });

  const createPurchaseOrderValidation = useFormik({
    initialValues: purchaseOrderInitialValues,
    validationSchema: createPurchaseOrderSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setFieldError }) => {
      let data = { ...values };
      data.purchase_order_detail = convertDataDetail(
        data.purchase_order_detail
      );
      data = {
        ...data,
        potype: data.potype.kode,
        tanggal_po: formatIsoToGen(data.tanggal_po),
        supplier: data.supplier.id,
        gudang: data.gudang.name,
      };
      console.log(data);
      try {
        const formattedData = filterFalsyValue({ ...data });
        let response = await createPurchaseOrder(formattedData);

        setSnackbar({
          state: true,
          type: "success",
          message: `"${data.nomor_po}" berhasil ditambahkan !`,
        });

        if (!snackbar.state) {
          resetForm();
          router.push(`/gudang/purchase-order/${response.data.data.id}`);
        }
      } catch (error) {
        if (Object.keys(error.errorValidationObj).length >= 1) {
          for (let key in error.errorValidationObj) {
            setFieldError(key, error.errorValidationObj[key][0]);
          }
        }
        setSnackbar({
          state: true,
          type: "error",
          message: `Terjadi kesalahan, "${data.nomor_po}" gagal ditambahkan !`,
        });
      }
    },
  });

  const createDetailDataHandler = (payload) => {
    let tempData = [
      ...createPurchaseOrderValidation.values.purchase_order_detail,
    ];
    const isAvailable = !isDialogItem.edit
      ? tempData.findIndex((data) => data.item.id === payload.item.id)
      : payload.index;

    if (isAvailable !== -1) {
      tempData[isAvailable] = payload;
    } else {
      tempData.push(payload);
    }
    createPurchaseOrderValidation.setFieldValue(
      "purchase_order_detail",
      tempData
    );
    setDataDetail(() => dataDetailFormatHandler(tempData));
  };

  const deleteDetailDataHandler = (payload) => {
    let tempData = [
      ...createPurchaseOrderValidation.values.purchase_order_detail,
    ];
    if (payload.index >= 0 && payload.index < tempData.length) {
      tempData.splice(payload.index, 1);
      createPurchaseOrderValidation.setFieldValue(
        "purchase_order_detail",
        tempData
      );
      setDataDetail(() => dataDetailFormatHandler(tempData));
    }
  };

  const btnEditHandler = (payload) => {
    let temp = {
      ...createPurchaseOrderValidation.values.purchase_order_detail[payload],
      index: payload,
    };

    setIsDialogItem({ state: true, edit: true });
    setDataDetailEdit(temp);
  };

  useEffect(() => {
    const nomor_po = "";
    if (
      createPurchaseOrderValidation.values.potype.kode != "" &&
      createPurchaseOrderValidation.values.tanggal_po != null
    ) {
      const year = formatIsoToGen(
        createPurchaseOrderValidation.values.tanggal_po
      ).substring(0, 4);
      const potype = createPurchaseOrderValidation.values.potype;
      nomor_po = `${potype.kode}${year}${String(
        potype.state_number + 1
      ).padStart(6, "0")}`;
    }
    createPurchaseOrderValidation.setFieldValue("nomor_po", nomor_po);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createPurchaseOrderValidation.values.potype,
    createPurchaseOrderValidation.values.tanggal_po,
  ]);

  return (
    <>
      <Paper sx={{ width: "100%", paddingTop: 3 }}>
        <form onSubmit={createPurchaseOrderValidation.handleSubmit}>
          <FocusError formik={createPurchaseOrderValidation} />
          <div className="p-16">
            <Grid container spacing={0}>
              <Grid item xs={12} md={6}>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Jenis Surat</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <div className="mb-16">
                      <SelectAsync
                        id="potype"
                        labelField="Jenis Surat"
                        labelOptionRef="name"
                        valueOptionRef="kode"
                        handlerRef={createPurchaseOrderValidation}
                        handlerFetchData={getPoType}
                        handlerOnChange={(value) => {
                          if (value) {
                            createPurchaseOrderValidation.setFieldValue(
                              "potype",
                              value
                            );
                          } else {
                            createPurchaseOrderValidation.setFieldValue(
                              "potype",
                              {
                                kode: "",
                                name: "",
                              }
                            );
                          }
                        }}
                      />
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Tanggal PO</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <div className="mb-16">
                      <FormControl fullWidth>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            id="tanggal_po"
                            name="tanggal_po"
                            label="Tanggal PO"
                            inputFormat="dd-MM-yyyy"
                            mask="__-__-____"
                            value={
                              createPurchaseOrderValidation.values.tanggal_po
                                ? formatGenToIso(
                                    createPurchaseOrderValidation.values
                                      .tanggal_po
                                  )
                                : null
                            }
                            onChange={(newValue) => {
                              createPurchaseOrderValidation.setFieldValue(
                                "tanggal_po",
                                newValue
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={
                                  createPurchaseOrderValidation.touched
                                    .tanggal_po &&
                                  Boolean(
                                    createPurchaseOrderValidation.errors
                                      .tanggal_po
                                  )
                                }
                                helperText={
                                  createPurchaseOrderValidation.touched
                                    .tanggal_po &&
                                  createPurchaseOrderValidation.errors
                                    .tanggal_po
                                }
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </FormControl>
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Nomor PO</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <div className="mb-16">
                      <TextField
                        fullWidth
                        id="nomor_po"
                        name="nomor_po"
                        label="Nomor PO"
                        value={createPurchaseOrderValidation.values.nomor_po}
                        onChange={createPurchaseOrderValidation.handleChange}
                        error={
                          createPurchaseOrderValidation.touched.nomor_po &&
                          Boolean(createPurchaseOrderValidation.errors.nomor_po)
                        }
                        helperText={
                          createPurchaseOrderValidation.touched.nomor_po &&
                          createPurchaseOrderValidation.errors.nomor_po
                        }
                        disabled
                      />
                    </div>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Supplier</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <div className="mb-16">
                      <SelectAsync
                        id="supplier"
                        labelField="Supplier"
                        labelOptionRef="name"
                        valueOptionRef="id"
                        handlerRef={createPurchaseOrderValidation}
                        handlerFetchData={getSupplier}
                        handlerOnChange={(value) => {
                          if (value) {
                            createPurchaseOrderValidation.setFieldValue(
                              "supplier",
                              value
                            );
                          } else {
                            createPurchaseOrderValidation.setFieldValue(
                              "supplier",
                              {
                                id: "",
                                name: "",
                              }
                            );
                          }
                        }}
                      />
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Gudang</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <div className="mb-16">
                      <SelectAsync
                        id="gudang"
                        labelField="Gudang"
                        labelOptionRef="name"
                        valueOptionRef="id"
                        handlerRef={createPurchaseOrderValidation}
                        handlerFetchData={jenisGudang}
                        handlerOnChange={(value) => {
                          if (value) {
                            createPurchaseOrderValidation.setFieldValue(
                              "gudang",
                              value
                            );
                          } else {
                            createPurchaseOrderValidation.setFieldValue(
                              "gudang",
                              {
                                id: "",
                                name: "",
                              }
                            );
                          }
                        }}
                      />
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Keterangan</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <div className="mb-16">
                      <TextField
                        fullWidth
                        id="keterangan"
                        name="keterangan"
                        label="Keterangan"
                        multiline
                        rows={3}
                        value={createPurchaseOrderValidation.values.keterangan}
                        onChange={createPurchaseOrderValidation.handleChange}
                        error={
                          createPurchaseOrderValidation.touched.keterangan &&
                          Boolean(
                            createPurchaseOrderValidation.errors.keterangan
                          )
                        }
                        helperText={
                          createPurchaseOrderValidation.touched.keterangan &&
                          createPurchaseOrderValidation.errors.keterangan
                        }
                      />
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>

          <Divider sx={{ borderWidth: "1px" }} />

          <div className="p-16">
            <TableLayoutDetailGudang
              baseRoutePath={`${router.asPath}`}
              title="Item"
              isBtnAdd
              isBtnDelete
              isEditType
              btnAddHandler={() =>
                setIsDialogItem({ state: true, edit: false })
              }
              btnEditHandler={btnEditHandler}
              btnDeleteHandler={deleteDetailDataHandler}
              tableHead={detailPoTableHead}
              data={dataDetail}
            />

            <DialogAddItem
              isEditType={isDialogItem.edit}
              isOpen={isDialogItem.state}
              handleClose={() => setIsDialogItem({ state: false, edit: false })}
              prePopulatedDataForm={dataDetailEdit}
              createData={createDetailDataHandler}
            />

            <div className="flex justify-end items-center mt-16">
              <Button
                type="button"
                variant="outlined"
                startIcon={<BackIcon />}
                sx={{ marginRight: 2 }}
                onClick={() => router.push("/gudang/purchase-order")}
              >
                Kembali
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                disabled={!isActionPermitted("purchaseOrder:store")}
                startIcon={<DoneIcon />}
                loadingPosition="start"
                loading={createPurchaseOrderValidation.isSubmitting}
              >
                Simpan Purchase Order
              </LoadingButton>
            </div>
          </div>
        </form>
      </Paper>
      <Snackbar
        state={snackbar.state}
        setState={setSnackbar}
        message={snackbar.message}
        isSuccessType={snackbar.type === "success"}
        isErrorType={snackbar.type === "error"}
      />
    </>
  );
};

export default FormPurchaseOrder;
