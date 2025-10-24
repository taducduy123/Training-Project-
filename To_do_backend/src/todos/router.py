from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from src.todos.schemas import TodoCreate, TodoUpdate, TodoResponse, TodoListResponse
from src.todos.service import TodoService
from src.todos.dependencies import get_todo_service, get_db

router = APIRouter(prefix="/todos", tags=["Todos"])


# -----------------------------
# List all todos with pagination
# -----------------------------
@router.get("", response_model=TodoListResponse)
def get_todos(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of items to return"),
    service: TodoService = Depends(get_todo_service)
):
    """Get all todos with pagination"""
    result = service.get_all_todos_paginated(skip, limit)
    items = [TodoResponse.from_orm(todo) for todo in result["items"]]
    return TodoListResponse(total=result["total"], items=items)


# -----------------------------
# Get a single todo
# -----------------------------
@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(
    todo_id: int,
    service: TodoService = Depends(get_todo_service)
):
    """Get a specific todo by ID"""
    todo = service.get_todo_by_id(todo_id)
    return TodoResponse.from_orm(todo)


# -----------------------------
# Create a todo
# -----------------------------
@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo: TodoCreate,
    service: TodoService = Depends(get_todo_service)
):
    """Create a new todo"""
    new_todo = service.create_todo(todo)
    return TodoResponse.from_orm(new_todo)


# -----------------------------
# Update a todo
# -----------------------------
@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo: TodoUpdate,
    service: TodoService = Depends(get_todo_service)
):
    """Update an existing todo"""
    updated_todo = service.update_todo(todo_id, todo)
    return TodoResponse.from_orm(updated_todo)


# -----------------------------
# Delete a todo
# -----------------------------
@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    service: TodoService = Depends(get_todo_service)
):
    """Delete a todo"""
    service.delete_todo(todo_id)
    return None


# -----------------------------
# Filtered routes (completed / pending)
# -----------------------------
@router.get("/filter/completed", response_model=TodoListResponse)
def get_completed_todos(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get completed todos"""
    service = TodoService(db)
    result = service.get_completed_todos_paginated(skip, limit)
    items = [TodoResponse.from_orm(todo) for todo in result["items"]]
    return TodoListResponse(total=result["total"], items=items)


@router.get("/filter/pending", response_model=TodoListResponse)
def get_pending_todos(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get pending todos"""
    service = TodoService(db)
    result = service.get_pending_todos_paginated(skip, limit)
    items = [TodoResponse.from_orm(todo) for todo in result["items"]]
    return TodoListResponse(total=result["total"], items=items)
