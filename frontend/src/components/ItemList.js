import ItemPreview from "./ItemPreview";
import ListPagination from "./ListPagination";
import React from "react";

const ItemList = (props) => {
  if (!props.items) {
    return <div className="py-4">Loading...</div>;
  }

  if (props.items?.length === 0) {
    if (props.title?.length > 2) {
      return (
        <div id="empty" className="py-4">
          <div className="d-flex flex-column mt-4">
            <div className="d-flex justify-content-center mt-4">
              No items found for "<strong>{props.title}</strong>"
            </div>
          </div>
        </div>
      );
    }
    return <div className="py-4 no-items">No items are here... yet.</div>;
  }

  return (
    <div className="container py-2">
      <div className="row">
        {props.items.map((item) => {
          return (
            <div className="col-sm-4 pb-2" key={item.slug}>
              <ItemPreview item={item} />
            </div>
          );
        })}
      </div>

      <ListPagination
        pager={props.pager}
        itemsCount={props.itemsCount}
        currentPage={props.currentPage}
      />
    </div>
  );
};

export default ItemList;
